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
    // Only fullName, category, and gender are required
    const requiredErrors = [];
    if (!fullName) requiredErrors.push("fullName");
    if (!category) requiredErrors.push("category");
    if (!gender) requiredErrors.push("gender");
    // subgroup is NOT required - remove from required check
    
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
      accessibilityUpdatedAt: new Date(),
      isActive: memberIsActive,
    };
    
    // Add optional fields if provided
    if (nationalId && nationalId.trim()) memberData.nationalId = nationalId.trim();
    if (dateOfBirth) memberData.dateOfBirth = new Date(dateOfBirth);
    if (phone && phone.trim()) memberData.phone = phone.trim();
    if (subgroup) memberData.subgroup = subgroup; // Only add if provided
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
// FIXED: Now returns array directly instead of object with pagination
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
    
    // Return array directly for frontend compatibility
    res.status(200).json(members);
    
  } catch (err) {
    console.error("Error in getAllMembers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET ALL MEMBERS WITH PAGINATION (Optional) =================
// If you need pagination, create a separate endpoint
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
        member.accessibilityUpdatedAt = new Date();
        
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
      // Remove old spouse reference if exists
      if (member.spouse && member.spouse !== updatedSpouse) {
        await Member.findByIdAndUpdate(member.spouse, {
          $unset: { spouse: "" }
        });
      }
      // Set new spouse reference
      await Member.findByIdAndUpdate(updatedSpouse, {
        spouse: member._id
      });
    } else if (updatedSpouse === null && member.spouse) {
      // Remove spouse reference if spouse is removed
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
};