import Member from "../mongoschema/memberschema.js";
import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import Amasakramentu from "../mongoschema/sakramentsSchema.js";
import mongoose from "mongoose";

// Helper function to find marriage sakrament ID
let marriageSakramentId = null;

const getMarriageSakramentId = async () => {
  if (marriageSakramentId) return marriageSakramentId;
  try {
    const marriage = await Amasakramentu.findOne({ 
      name: { $regex: /Ugushyingirwa/i } 
    });
    marriageSakramentId = marriage?._id;
    return marriageSakramentId;
  } catch (err) {
    console.error("Could not find marriage sakrament:", err);
    return null;
  }
};

// ================= CREATE MEMBER =================
export const createMember = async (req, res) => {
  try {
    console.log("🔍 ========== CREATE MEMBER START ==========");
    console.log("📦 Request body received:", JSON.stringify(req.body, null, 2));
    console.log("👤 User making request:", req.user?._id, req.user?.role);

    const {
      fullName,
      category,
      nationalId,
      dateOfBirth,
      phone,
      parent,
      gender,
      subgroup,
      sakraments,
      spouse,
      accessibility,
      accessibilityNotes,
      isActive,
    } = req.body;

    // ================= REQUIRED FIELDS VALIDATION =================
    const requiredErrors = [];
    if (!fullName) requiredErrors.push("fullName");
    if (!category) requiredErrors.push("category");
    if (!gender) requiredErrors.push("gender");
    
    if (requiredErrors.length > 0) {
      return res.status(400).json({
        message: `Missing required fields: ${requiredErrors.join(", ")}`,
      });
    }

    // ================= CATEGORY VALIDATION =================
    const validCategories = ["child", "youth", "adult"];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message: "Category must be child, youth, or adult",
      });
    }

    // ================= SUBGROUP VALIDATION (OPTIONAL) =================
    if (subgroup) {
      if (!mongoose.Types.ObjectId.isValid(subgroup)) {
        return res.status(400).json({
          message: "Invalid subgroup ID format",
        });
      }
      
      // Verify subgroup exists if provided
      const Subgroup = mongoose.model("subgroups");
      const subgroupExists = await Subgroup.findById(subgroup);
      if (!subgroupExists) {
        return res.status(400).json({
          message: "Subgroup not found",
        });
      }
    }

    // ================= PARENT VALIDATION =================
    if (category !== "adult") {
      if (!parent) {
        return res.status(400).json({
          message: category === "child" 
            ? "Umwana agomba kugira umubyeyi" 
            : "Urubyiruko rugomba kugira umubyeyi",
        });
      }
      
      if (!mongoose.Types.ObjectId.isValid(parent)) {
        return res.status(400).json({
          message: "Invalid parent ID format",
        });
      }
      
      // Check if parent exists
      const parentExists = await Member.findById(parent);
      if (!parentExists) {
        return res.status(400).json({
          message: "Umubyeyi ntabaho",
        });
      }
    }

    // ================= SAKRAMENTS SAFETY =================
    let safeSakraments = [];
    
    if (sakraments && Array.isArray(sakraments)) {
      const validIds = sakraments.filter(id => 
        id && mongoose.Types.ObjectId.isValid(id)
      );
      
      if (validIds.length > 0) {
        const found = await Amasakramentu.find({
          _id: { $in: validIds },
        });
        safeSakraments = found.map(s => s._id);
      }
    }

    // ================= MARRIAGE CHECK =================
    let hasMarriage = false;
    const marriage = await Amasakramentu.findOne({ 
      name: { $regex: /Ugushyingirwa/i } 
    });
    
    if (marriage) {
      hasMarriage = safeSakraments.some(
        id => id && id.toString() === marriage._id.toString()
      );
    }

    // ================= SPOUSE VALIDATION =================
    if (hasMarriage) {
      if (!spouse) {
        return res.status(400).json({
          message: "Ugomba gushyiraho uwo mwashyingiranywe",
        });
      }
      
      if (!mongoose.Types.ObjectId.isValid(spouse)) {
        return res.status(400).json({
          message: "Invalid spouse ID format",
        });
      }
      
      const spouseExists = await Member.findById(spouse);
      if (!spouseExists) {
        return res.status(400).json({
          message: "Uwo mwashyingiranywe ntabaho",
        });
      }
      
      // Check if spouse is of opposite gender
      if (spouseExists.gender === gender) {
        return res.status(400).json({
          message: "Ugushyingirwa bigomba gukorwa n'umuntu w'igitsina gitandukanye",
        });
      }
      
      // Check if spouse is already married
      if (spouseExists.spouse) {
        return res.status(400).json({
          message: "Uwo mwashyingiranywe yashyingiranywe n'undi",
        });
      }
    }

    // ================= ACCESSIBILITY VALIDATION =================
    const memberAccessibility = accessibility || "alive";
    const validAccessibility = ["alive", "dead", "moved"];
    
    if (!validAccessibility.includes(memberAccessibility)) {
      return res.status(400).json({
        message: "Invalid accessibility status",
      });
    }
    
    const memberIsActive = isActive !== undefined 
      ? isActive 
      : memberAccessibility === "alive";
    
    if (memberAccessibility !== "alive" && (!accessibilityNotes || accessibilityNotes.trim() === "")) {
      return res.status(400).json({
        message: "Accessibility notes are required when member is dead or moved",
      });
    }

    // ================= NATIONAL ID UNIQUENESS =================
    if (nationalId && nationalId.trim()) {
      const existingMember = await Member.findOne({ nationalId });
      if (existingMember) {
        return res.status(400).json({
          message: "Indangamuntu isanzwe ikoreshwa n'undi muntu",
        });
      }
    }

    // ================= BUILD MEMBER DATA =================
    const memberData = {
      fullName: fullName.trim(),
      category,
      gender,
      accessibility: memberAccessibility,
      isActive: memberIsActive,
    };
    
    // Add optional fields if provided
    if (nationalId && nationalId.trim()) memberData.nationalId = nationalId.trim();
    if (dateOfBirth) memberData.dateOfBirth = new Date(dateOfBirth);
    if (phone && phone.trim()) memberData.phone = phone.trim();
    if (subgroup) memberData.subgroup = subgroup;
    if (parent && category !== "adult") memberData.parent = parent;
    if (hasMarriage && spouse) memberData.spouse = spouse;
    if (accessibilityNotes && accessibilityNotes.trim()) {
      memberData.accessibilityNotes = accessibilityNotes.trim();
    }
    if (safeSakraments.length > 0) memberData.sakraments = safeSakraments;

    console.log("📦 Final member data:", JSON.stringify(memberData, null, 2));
    
    // ================= CREATE MEMBER =================
    const member = await Member.create(memberData);
    console.log("✅ Member created successfully:", member._id);
    
    // ================= LINK SPOUSE =================
    if (hasMarriage && spouse) {
      await Member.findByIdAndUpdate(spouse, {
        spouse: member._id,
      });
      console.log("✅ Spouse linked:", spouse);
    }
    
    // ================= POPULATE AND RETURN =================
    const populatedMember = await Member.findById(member._id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("spouse", "fullName category");
    
    res.status(201).json({
      message: "Member created successfully",
      member: populatedMember,
    });
    
  } catch (err) {
    console.error("❌ ERROR in createMember:", err);
    console.error("❌ Error details:", err);
    
    // Handle specific MongoDB errors
    if (err.name === "CastError") {
      return res.status(400).json({
        message: "Invalid ID format provided",
      });
    }
    
    if (err.name === "ValidationError") {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        message: "Validation error",
        errors: errors,
      });
    }
    
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      if (field === "nationalId") {
        return res.status(400).json({
          message: "Indangamuntu isanzwe ikoreshwa n'undi muntu",
        });
      }
      return res.status(400).json({
        message: `Duplicate value for ${field}`,
      });
    }
    
    res.status(500).json({
      message: "Server error. Please try again later.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
  }
};

// ================= GET ALL MEMBERS =================
export const getAllMembers = async (req, res) => {
  try {
    const { category, gender, subgroup } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    if (subgroup) filter.subgroup = subgroup;
    
    const members = await Member.find(filter)
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("parent", "fullName category")
      .populate("spouse", "fullName category")
      .select("-nationalId")
      .sort({ createdAt: -1 });
    
    res.status(200).json(members);
    
  } catch (err) {
    console.error("Error in getAllMembers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL MEMBERS WITH PAGINATION =================
export const getAllMembersWithPagination = async (req, res) => {
  try {
    const { category, gender, subgroup, page = 1, limit = 100 } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (gender) filter.gender = gender;
    if (subgroup) filter.subgroup = subgroup;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [members, total] = await Promise.all([
      Member.find(filter)
        .populate("subgroup", "name")
        .populate("sakraments", "name")
        .populate("parent", "fullName category")
        .populate("spouse", "fullName category")
        .select("-nationalId")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      Member.countDocuments(filter)
    ]);
    
    res.status(200).json({
      members,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Error in getAllMembersWithPagination:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= SEARCH MEMBERS =================
export const searchMembers = async (req, res) => {
  try {
    const { name, subgroup } = req.query;
    const today = new Date();
    
    if (!subgroup) {
      return res.status(400).json({
        message: "Subgroup is required for search",
      });
    }
    
    const filter = { subgroup };
    
    if (name && name.trim() !== "") {
      filter.fullName = { $regex: name.trim(), $options: "i" };
    }
    
    const members = await Member.find(filter)
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("parent", "fullName category")
      .populate("spouse", "fullName category")
      .select("-nationalId");
    
    if (members.length === 0) {
      return res.status(200).json([]);
    }
    
    const memberIds = members.map(m => m._id);
    
    const pastEvents = await Event.find({
      date: { $lte: today },
    }).select("_id");
    
    const pastEventIds = pastEvents.map(e => e._id);
    const totalEvents = pastEventIds.length;
    
    const allAttendance = await Attendance.find({
      member: { $in: memberIds },
    })
      .populate("event", "title date")
      .sort({ createdAt: -1 });
    
    const attendanceMap = {};
    const attendanceCountMap = {};
    
    allAttendance.forEach(record => {
      const memberId = record.member.toString();
      
      if (!attendanceMap[memberId]) {
        attendanceMap[memberId] = [];
      }
      attendanceMap[memberId].push(record);
      
      if (
        record.status === "present" &&
        pastEventIds.some(id => id.equals(record.event?._id))
      ) {
        attendanceCountMap[memberId] = (attendanceCountMap[memberId] || 0) + 1;
      }
    });
    
    const results = members.map(member => {
      const memberId = member._id.toString();
      const attendedEvents = attendanceCountMap[memberId] || 0;
      
      const attendancePercentage = totalEvents === 0
        ? 0
        : Math.round((attendedEvents / totalEvents) * 100);
      
      const status = attendancePercentage >= 30 ? "ACTIVE" : "NOT ACTIVE";
      
      return {
        ...member.toObject(),
        attendance: attendanceMap[memberId] || [],
        decision: {
          totalEvents,
          attendedEvents,
          attendancePercentage,
          status,
        },
      };
    });
    
    res.status(200).json(results);
    
  } catch (err) {
    console.error("Error in searchMembers:", err);
    res.status(500).json({ message: "Search failed" });
  }
};

// ================= GET MEMBER BY ID =================
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("spouse", "fullName category");
    
    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    
    res.status(200).json(member);
  } catch (err) {
    console.error("Error in getMemberById:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid member ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ================= UPDATE MEMBER =================
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    
    const {
      fullName,
      category,
      nationalId,
      dateOfBirth,
      phone,
      parent,
      gender,
      subgroup,
      sakraments,
      spouse,
      accessibility,
      accessibilityNotes,
      isActive,
    } = req.body;
    
    // Determine updated values before validation
    const updatedCategory = category ?? member.category;
    const updatedParent = parent !== undefined ? parent : member.parent;
    
    // Parent validation based on category
    if (updatedCategory !== "adult") {
      if (!updatedParent) {
        return res.status(400).json({
          message: `${updatedCategory === "child" ? "Umwana" : "Urubyiruko"} agomba kugira umubyeyi`,
        });
      }
      
      if (updatedParent && !mongoose.Types.ObjectId.isValid(updatedParent)) {
        return res.status(400).json({
          message: "Invalid parent ID format",
        });
      }
    }
    
    // Spouse validation
    const marriageId = await getMarriageSakramentId();
    const updatedSakraments = sakraments !== undefined ? sakraments : member.sakraments;
    const hasMarriage = updatedSakraments?.some(sak => sak && sak.toString() === marriageId?.toString());
    const updatedSpouse = spouse !== undefined ? spouse : member.spouse;
    
    if (hasMarriage && !updatedSpouse) {
      return res.status(400).json({
        message: "Ugomba gushyiraho uwo mwashyingiranywe",
      });
    }
    
    if (updatedSpouse && updatedSpouse.toString() === member._id.toString()) {
      return res.status(400).json({
        message: "Ntushobora kwishyingira",
      });
    }
    
    if (updatedSpouse) {
      if (!mongoose.Types.ObjectId.isValid(updatedSpouse)) {
        return res.status(400).json({
          message: "Invalid spouse ID format",
        });
      }
      
      const spouseExists = await Member.findById(updatedSpouse);
      if (!spouseExists) {
        return res.status(400).json({
          message: "Uwo mwashyingiranywe ntabaho",
        });
      }
    }
    
    // Apply basic updates
    if (fullName !== undefined) member.fullName = fullName.trim();
    if (category !== undefined) member.category = category;
    if (nationalId !== undefined) member.nationalId = nationalId?.trim();
    if (dateOfBirth !== undefined) member.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null;
    if (phone !== undefined) member.phone = phone?.trim();
    if (gender !== undefined) member.gender = gender;
    if (subgroup !== undefined) member.subgroup = subgroup;
    if (sakraments !== undefined) member.sakraments = sakraments;
    if (spouse !== undefined) member.spouse = spouse;
    if (isActive !== undefined) member.isActive = isActive;
    
    // Handle accessibility update
    if (accessibility !== undefined) {
      const oldAccessibility = member.accessibility;
      member.accessibility = accessibility;
      
      if (oldAccessibility !== accessibility) {
        if (accessibilityNotes !== undefined) {
          member.accessibilityNotes = accessibilityNotes?.trim();
        }
        
        if (accessibility === "dead" || accessibility === "moved") {
          member.isActive = false;
        } else if (accessibility === "alive") {
          if (isActive === undefined) {
            member.isActive = true;
          }
        }
      }
    } else if (accessibilityNotes !== undefined) {
      member.accessibilityNotes = accessibilityNotes?.trim();
    }
    
    // Parent handling based on category
    if (updatedCategory !== "adult") {
      member.parent = updatedParent;
    } else {
      member.parent = updatedParent || null;
    }
    
    await member.save();
    
    // Update spouse's record to maintain bidirectional link
    if (updatedSpouse && updatedSpouse !== member.spouse) {
      if (member.spouse && member.spouse !== updatedSpouse) {
        await Member.findByIdAndUpdate(member.spouse, {
          $unset: { spouse: "" }
        });
      }
      await Member.findByIdAndUpdate(updatedSpouse, {
        spouse: member._id
      });
    } else if (updatedSpouse === null && member.spouse) {
      await Member.findByIdAndUpdate(member.spouse, {
        $unset: { spouse: "" }
      });
    }
    
    const updatedMember = await Member.findById(member._id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("spouse", "fullName category");
    
    res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (err) {
    console.error("Error in updateMember:", err);
    
    if (err.code === 11000 && err.keyPattern?.nationalId) {
      return res.status(400).json({ 
        message: "Indangamuntu isanzwe ikoreshwa n'undi muntu" 
      });
    }
    
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE MEMBER =================
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    
    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    
    // Check if member has children
    const hasChildren = await Member.findOne({
      parent: member._id,
    });
    
    if (hasChildren) {
      return res.status(400).json({
        message: "Ntushobora gusiba umubyeyi ufite abana",
      });
    }
    
    // If member has a spouse, remove the spouse reference
    if (member.spouse) {
      await Member.findByIdAndUpdate(member.spouse, {
        $unset: { spouse: "" }
      });
    }
    
    await Member.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      message: "Member deleted successfully",
    });
  } catch (err) {
    console.error("Error in deleteMember:", err);
    if (err.name === "CastError") {
      return res.status(400).json({ message: "Invalid member ID format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};// ================= GET MEMBER WITH FAMILY =================
export const getMemberWithFamily = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid member ID format",
      });
    }
    
    // Get the main member
    const member = await Member.findById(id)
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("parent", "fullName category gender")
      .populate("spouse", "fullName category gender");
    
    if (!member) {
      return res.status(404).json({
        message: "Member not found",
      });
    }
    
    // Get children (members who have this member as parent)
    const children = await Member.find({ parent: member._id })
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .select("fullName category gender dateOfBirth isActive")
      .sort({ createdAt: -1 });
    
    // Get siblings (other children of the same parents)
    let siblings = [];
    if (member.parent) {
      siblings = await Member.find({
        parent: member.parent,
        _id: { $ne: member._id } // Exclude current member
      })
        .populate("subgroup", "name")
        .select("fullName category gender dateOfBirth isActive")
        .sort({ fullName: 1 });
    }
    
    // Get grandparents (parents of the member's parents)
    let grandparents = [];
    if (member.parent) {
      const parent = await Member.findById(member.parent);
      if (parent && parent.parent) {
        grandparents = await Member.find({
          _id: parent.parent
        })
          .select("fullName category gender dateOfBirth")
          .lean();
      }
    }
    
    // Get grandchildren (children of the member's children)
    let grandchildren = [];
    if (children.length > 0) {
      const childrenIds = children.map(child => child._id);
      grandchildren = await Member.find({
        parent: { $in: childrenIds }
      })
        .populate("subgroup", "name")
        .select("fullName category gender dateOfBirth")
        .sort({ createdAt: -1 });
    }
    
    // Get in-laws (spouse's parents and siblings)
    let inLaws = {
      spouseParents: null,
      spouseSiblings: []
    };
    
    if (member.spouse) {
      const spouse = await Member.findById(member.spouse);
      if (spouse) {
        // Spouse's parents
        if (spouse.parent) {
          inLaws.spouseParents = await Member.findById(spouse.parent)
            .select("fullName category gender");
        }
        
        // Spouse's siblings
        if (spouse.parent) {
          inLaws.spouseSiblings = await Member.find({
            parent: spouse.parent,
            _id: { $ne: spouse._id }
          })
            .select("fullName category gender")
            .sort({ fullName: 1 });
        }
      }
    }
    
    // Build the family tree
    const familyTree = {
      // Main member
      member: {
        _id: member._id,
        fullName: member.fullName,
        category: member.category,
        gender: member.gender,
        dateOfBirth: member.dateOfBirth,
        phone: member.phone,
        isActive: member.isActive,
        accessibility: member.accessibility,
        subgroup: member.subgroup,
        sakraments: member.sakraments,
      },
      
      // Family relationships
      family: {
        // Parents
        parents: member.parent ? [member.parent] : [],
        
        // Siblings
        siblings: siblings.map(s => ({
          _id: s._id,
          fullName: s.fullName,
          category: s.category,
          gender: s.gender,
          dateOfBirth: s.dateOfBirth,
          isActive: s.isActive,
        })),
        
        // Children
        children: children.map(c => ({
          _id: c._id,
          fullName: c.fullName,
          category: c.category,
          gender: c.gender,
          dateOfBirth: c.dateOfBirth,
          isActive: c.isActive,
          subgroup: c.subgroup,
        })),
        
        // Grandchildren
        grandchildren: grandchildren.map(gc => ({
          _id: gc._id,
          fullName: gc.fullName,
          category: gc.category,
          gender: gc.gender,
          dateOfBirth: gc.dateOfBirth,
          subgroup: gc.subgroup,
          parent: gc.parent,
        })),
        
        // Grandparents
        grandparents: grandparents.map(gp => ({
          _id: gp._id,
          fullName: gp.fullName,
          category: gp.category,
          gender: gp.gender,
        })),
        
        // Spouse
        spouse: member.spouse,
        
        // In-laws
        inLaws: inLaws,
      },
      
      // Summary statistics
      summary: {
        totalChildren: children.length,
        totalSiblings: siblings.length,
        totalGrandchildren: grandchildren.length,
        hasSpouse: !!member.spouse,
        hasParents: !!member.parent,
        hasGrandparents: grandparents.length > 0,
      }
    };
    
    res.status(200).json(familyTree);
    
  } catch (err) {
    console.error("Error in getMemberWithFamily:", err);
    res.status(500).json({ 
      message: "Error fetching family information",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// ================= GET FAMILY TREE BY FAMILY NAME/ID =================
export const getFamilyTree = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid family ID format",
      });
    }
    
    // Get the root member (usually the parent/head of family)
    const rootMember = await Member.findById(id)
      .populate("subgroup", "name");
    
    if (!rootMember) {
      return res.status(404).json({
        message: "Family head not found",
      });
    }
    
    // Recursive function to build family tree
    async function buildFamilyTree(memberId, level = 0, maxLevel = 3) {
      if (level > maxLevel) return null;
      
      const member = await Member.findById(memberId)
        .populate("subgroup", "name")
        .populate("sakraments", "name")
        .populate("spouse", "fullName category gender");
      
      if (!member) return null;
      
      // Get children
      const children = await Member.find({ parent: member._id })
        .select("fullName category gender dateOfBirth isActive");
      
      // Recursively build children trees
      const childrenTrees = await Promise.all(
        children.map(async (child) => {
          const childTree = await buildFamilyTree(child._id, level + 1, maxLevel);
          return {
            ...child.toObject(),
            children: childTree ? childTree.children : [],
            spouse: childTree ? childTree.spouse : null,
          };
        })
      );
      
      return {
        _id: member._id,
        fullName: member.fullName,
        category: member.category,
        gender: member.gender,
        dateOfBirth: member.dateOfBirth,
        isActive: member.isActive,
        accessibility: member.accessibility,
        subgroup: member.subgroup,
        sakraments: member.sakraments,
        spouse: member.spouse,
        children: childrenTrees,
        level: level,
      };
    }
    
    const familyTree = await buildFamilyTree(rootMember._id);
    
    res.status(200).json({
      familyHead: {
        _id: rootMember._id,
        fullName: rootMember.fullName,
        category: rootMember.category,
      },
      familyTree: familyTree,
      totalMembers: await countFamilyMembers(rootMember._id),
    });
    
  } catch (err) {
    console.error("Error in getFamilyTree:", err);
    res.status(500).json({ 
      message: "Error fetching family tree",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// Helper function to count total family members
async function countFamilyMembers(rootId) {
  let count = 1; // Count the root member
  
  const children = await Member.find({ parent: rootId });
  
  for (const child of children) {
    count += await countFamilyMembers(child._id);
  }
  
  return count;
}

// ================= GET MEMBERS BY FAMILY (Group by Parent) =================
export const getMembersByFamily = async (req, res) => {
  try {
    // Get all members grouped by parent
    const allMembers = await Member.find({})
      .populate("parent", "fullName category")
      .populate("spouse", "fullName category")
      .select("fullName category gender parent spouse dateOfBirth isActive")
      .sort({ fullName: 1 });
    
    // Group members by parent
    const families = {};
    
    // First, organize all members
    allMembers.forEach(member => {
      const parentId = member.parent ? member.parent._id.toString() : "orphans";
      
      if (!families[parentId]) {
        families[parentId] = {
          parent: member.parent || null,
          children: [],
          parentInfo: member.parent ? {
            _id: member.parent._id,
            fullName: member.parent.fullName,
            category: member.parent.category,
          } : null,
        };
      }
      
      families[parentId].children.push({
        _id: member._id,
        fullName: member.fullName,
        category: member.category,
        gender: member.gender,
        dateOfBirth: member.dateOfBirth,
        isActive: member.isActive,
        spouse: member.spouse,
      });
    });
    
    // Convert to array and sort
    const familiesList = Object.values(families)
      .filter(family => family.parent !== null) // Remove orphans
      .sort((a, b) => {
        if (!a.parentInfo) return 1;
        if (!b.parentInfo) return -1;
        return a.parentInfo.fullName.localeCompare(b.parentInfo.fullName);
      });
    
    // Get orphans (members without parents)
    const orphans = families["orphans"]?.children || [];
    
    res.status(200).json({
      totalFamilies: familiesList.length,
      totalOrphans: orphans.length,
      families: familiesList,
      orphans: orphans,
    });
    
  } catch (err) {
    console.error("Error in getMembersByFamily:", err);
    res.status(500).json({ 
      message: "Error fetching family groups",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};