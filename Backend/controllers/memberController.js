import Member from "../mongoschema/memberschema.js";
import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import Amasakramentu from "../mongoschema/sakramentsSchema.js"; // Added import
import mongoose from "mongoose";

// Helper function to find marriage sakrament ID
let marriageSakramentId = null;

const getMarriageSakramentId = async () => {
  if (marriageSakramentId) return marriageSakramentId;
  try {
    const marriage = await Amasakramentu.findOne({ name: "Ugushyingirwa" });
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

    console.log("✅ Extracted fields:", {
      fullName,
      category,
      gender,
      subgroup,
      parent: parent || "null",
      spouse: spouse || "null",
      sakramentsCount: sakraments?.length || 0,
      accessibility
    });

    // Validate required fields
    if (!fullName) {
      console.log("❌ Missing fullName");
      return res.status(400).json({ message: "Full name is required" });
    }
    
    if (!category) {
      console.log("❌ Missing category");
      return res.status(400).json({ message: "Category is required" });
    }
    
    if (!gender) {
      console.log("❌ Missing gender");
      return res.status(400).json({ message: "Gender is required" });
    }
    
    if (!subgroup) {
      console.log("❌ Missing subgroup");
      return res.status(400).json({ message: "Subgroup is required" });
    }

    console.log("✅ Required fields validated");

    // Parent validation based on category
    if (category !== "adult") {
      console.log("🔍 Checking parent for non-adult category:", category);
      if (!parent || parent === "" || parent === "null" || parent === "undefined") {
        console.log("❌ Parent missing for non-adult");
        return res.status(400).json({
          message: `${category === "child" ? "Umwana" : "Urubyiruko"} agomba kugira umubyeyi`,
        });
      }
    }

    console.log("✅ Parent validation passed");

    // Spouse validation - only if marriage sakrament is selected
    console.log("🔍 Checking marriage sakrament...");
    let hasMarriage = false;
    let marriageId = null;
    
    try {
      // Safely get marriage sakrament ID
      const Amasakramentu = mongoose.model("Amasakramentu");
      const marriage = await Amasakramentu.findOne({ name: "Ugushyingirwa" });
      if (marriage) {
        marriageId = marriage._id;
        hasMarriage = sakraments?.some(sak => sak && sak.toString() === marriageId.toString());
        console.log("✅ Marriage sakrament found:", marriageId);
        console.log("🔍 Has marriage in selected sakraments:", hasMarriage);
      } else {
        console.log("⚠️ Marriage sakrament not found in database");
      }
    } catch (err) {
      console.error("❌ Error checking marriage sakrament:", err);
    }

    if (hasMarriage && (!spouse || spouse === "" || spouse === "null")) {
      console.log("❌ Marriage selected but no spouse provided");
      return res.status(400).json({
        message: "Ugomba gushyiraho uwo mwashyingiranywe",
      });
    }

    if (spouse && spouse === req.body._id) {
      console.log("❌ Self-marriage attempted");
      return res.status(400).json({
        message: "Ntushobora kwishyingira",
      });
    }

    console.log("✅ Spouse validation passed");

    // Accessibility validation
    const memberAccessibility = accessibility || "alive";
    const memberIsActive = isActive !== undefined ? isActive : 
                          (memberAccessibility === "alive" ? true : false);

    if (memberAccessibility !== "alive" && (!accessibilityNotes || accessibilityNotes === "")) {
      console.log("❌ Accessibility notes missing for non-alive status");
      return res.status(400).json({
        message: "Accessibility notes are required when status is not 'alive'",
      });
    }

    console.log("✅ Accessibility validation passed");

    // Prepare member data
    console.log("📝 Preparing member data...");
    const memberData = {
      fullName,
      category,
      gender,
      subgroup,
      accessibility: memberAccessibility,
      accessibilityUpdatedAt: new Date(),
      isActive: memberIsActive,
    };

    // Add optional fields
    if (nationalId && nationalId !== "") memberData.nationalId = nationalId;
    if (dateOfBirth && dateOfBirth !== "") memberData.dateOfBirth = dateOfBirth;
    if (phone && phone !== "") memberData.phone = phone;
    if (sakraments && sakraments.length > 0) memberData.sakraments = sakraments;
    if (accessibilityNotes && accessibilityNotes !== "") memberData.accessibilityNotes = accessibilityNotes;
    
    if (parent && parent !== "" && parent !== "null" && parent !== "undefined") {
      console.log("🔍 Adding parent:", parent);
      memberData.parent = parent;
    }
    
    if (spouse && spouse !== "" && spouse !== "null" && spouse !== "undefined") {
      console.log("🔍 Adding spouse:", spouse);
      memberData.spouse = spouse;
    }

    console.log("📦 Final member data to save:", JSON.stringify(memberData, null, 2));

    // Create member
    console.log("💾 Creating member in database...");
    const member = await Member.create(memberData);
    console.log("✅ Member created with ID:", member._id);
    
    // Update spouse's record if spouse exists
    if (spouse && spouse !== "" && spouse !== "null") {
      console.log("🔗 Updating spouse record:", spouse);
      await Member.findByIdAndUpdate(spouse, { spouse: member._id });
      console.log("✅ Spouse record updated");
    }

    // Populate and return
    console.log("📚 Populating member data...");
    const populatedMember = await Member.findById(member._id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("spouse", "fullName category");

    console.log("✅ Member creation complete!");
    console.log("🔍 ========== CREATE MEMBER END ==========");

    res.status(201).json({
      message: "Member created successfully",
      member: populatedMember,
    });
    
  } catch (err) {
    console.error("❌ ========== CREATE MEMBER ERROR ==========");
    console.error("❌ Error name:", err.name);
    console.error("❌ Error message:", err.message);
    console.error("❌ Error stack:", err.stack);
    
    if (err.code === 11000 && err.keyPattern?.nationalId) {
      console.log("❌ Duplicate national ID detected");
      return res.status(400).json({ 
        message: "Indangamuntu isanzwe ikoreshwa" 
      });
    }
    
    res.status(500).json({ 
      message: "Server error",
      error: err.message 
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
      .select("-nationalId");

    res.status(200).json(members);
  } catch (err) {
    console.error(err);
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
        attendanceCountMap[memberId] =
          (attendanceCountMap[memberId] || 0) + 1;
      }
    });

    const results = members.map(member => {
      const memberId = member._id.toString();
      const attendedEvents = attendanceCountMap[memberId] || 0;

      const attendancePercentage =
        totalEvents === 0
          ? 0
          : Math.round((attendedEvents / totalEvents) * 100);

      const status =
        attendancePercentage >= 30 ? "ACTIVE" : "NOT ACTIVE";

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
    console.error(err);
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
    console.error(err);
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
    }

    // Spouse validation
    const marriageId = await getMarriageSakramentId();
    const updatedSakraments = sakraments !== undefined ? sakraments : member.sakraments;
    const hasMarriage = updatedSakraments?.some(sak => sak.toString() === marriageId?.toString());
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
      const spouseExists = await Member.findById(updatedSpouse);
      if (!spouseExists) {
        return res.status(400).json({
          message: "Uwo mwashyingiranywe ntabaho",
        });
      }
    }

    // Apply basic updates
    if (fullName !== undefined) member.fullName = fullName;
    if (category !== undefined) member.category = category;
    if (nationalId !== undefined) member.nationalId = nationalId;
    if (dateOfBirth !== undefined) member.dateOfBirth = dateOfBirth;
    if (phone !== undefined) member.phone = phone;
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
          member.accessibilityNotes = accessibilityNotes;
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
      member.accessibilityNotes = accessibilityNotes;
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
    console.error(err);
    
    if (err.code === 11000 && err.keyPattern?.nationalId) {
      return res.status(400).json({ 
        message: "Indangamuntu isanzwe ikoreshwa" 
      });
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
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};