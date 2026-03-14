import Member from "../mongoschema/memberschema.js";
import Attendance from "../mongoschema/attendanceSchema.js";
import Event from "../mongoschema/eventschema.js";
import mongoose from "mongoose";

// ================= CREATE MEMBER =================
export const createMember = async (req, res) => {
  try {
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
      accessibility,
      accessibilityNotes,
      isActive,
    } = req.body;

    // Parent validation based on category
    if (category !== "adult") {
      // For child and youth, parent is required
      if (!parent) {
        return res.status(400).json({
          message: `${category === "child" ? "Umwana" : "Urubyiruko"} agomba kugira umubyeyi`,
        });
      }
    }
    // For adults, parent is optional - no validation needed

    // Set default values for accessibility fields
    const memberAccessibility = accessibility || "alive";
    const memberIsActive = isActive !== undefined ? isActive : 
                          (memberAccessibility === "alive" ? true : false);

    // Validate accessibility logic
    if (memberAccessibility !== "alive" && !accessibilityNotes) {
      return res.status(400).json({
        message: "Accessibility notes are required when status is not 'alive'",
      });
    }

    const member = await Member.create({
      fullName,
      category,
      nationalId,
      dateOfBirth,
      phone,
      parent: parent || null, // Adults can have null parent
      gender,
      subgroup,
      sakraments: sakraments || [],
      accessibility: memberAccessibility,
      accessibilityNotes: accessibilityNotes || "",
      accessibilityUpdatedAt: new Date(),
      isActive: memberIsActive,
    });

    // Populate references for response
    const populatedMember = await Member.findById(member._id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name");

    res.status(201).json({
      message: "Member created successfully",
      member: populatedMember,
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error for nationalId
    if (err.code === 11000 && err.keyPattern?.nationalId) {
      return res.status(400).json({ 
        message: "Indangamuntu isanzwe ikoreshwa" 
      });
    }
    
    res.status(500).json({ message: "Server error" });
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
      .select("-nationalId"); // hide national ID

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

    // Get members with populated fields
    const members = await Member.find(filter)
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("parent", "fullName category")
      .select("-nationalId");

    if (members.length === 0) {
      return res.status(200).json([]);
    }

    const memberIds = members.map(m => m._id);

    // Get past events
    const pastEvents = await Event.find({
      date: { $lte: today },
    }).select("_id");

    const pastEventIds = pastEvents.map(e => e._id);
    const totalEvents = pastEventIds.length;

    // Get ALL attendance for these members in ONE query
    const allAttendance = await Attendance.find({
      member: { $in: memberIds },
    })
      .populate("event", "title date")
      .sort({ createdAt: -1 });

    // Group attendance by member
    const attendanceMap = {};
    const attendanceCountMap = {};

    allAttendance.forEach(record => {
      const memberId = record.member.toString();

      // History
      if (!attendanceMap[memberId]) {
        attendanceMap[memberId] = [];
      }
      attendanceMap[memberId].push(record);

      // Count present for past events only
      if (
        record.status === "present" &&
        pastEventIds.some(id => id.equals(record.event?._id))
      ) {
        attendanceCountMap[memberId] =
          (attendanceCountMap[memberId] || 0) + 1;
      }
    });

    // Build final result
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
      .populate("sakraments", "name");

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
      accessibility,
      accessibilityNotes,
      isActive,
    } = req.body;

    // Determine updated values before validation
    const updatedCategory = category ?? member.category;
    const updatedParent = parent !== undefined ? parent : member.parent;

    // Parent validation based on category
    if (updatedCategory !== "adult") {
      // For child and youth, parent is required
      if (!updatedParent) {
        return res.status(400).json({
          message: `${updatedCategory === "child" ? "Umwana" : "Urubyiruko"} agomba kugira umubyeyi`,
        });
      }
    }
    // For adults, parent is optional - no validation needed

    // Apply basic updates
    if (fullName !== undefined) member.fullName = fullName;
    if (category !== undefined) member.category = category;
    if (nationalId !== undefined) member.nationalId = nationalId;
    if (dateOfBirth !== undefined) member.dateOfBirth = dateOfBirth;
    if (phone !== undefined) member.phone = phone;
    if (gender !== undefined) member.gender = gender;
    if (subgroup !== undefined) member.subgroup = subgroup;
    if (sakraments !== undefined) member.sakraments = sakraments;
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
        
        // Auto-logic based on accessibility
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
      // For child and youth, set parent (already validated)
      member.parent = updatedParent;
    } else {
      // For adults, parent can be null or a value
      member.parent = updatedParent || null;
    }

    await member.save();

    // Populate references for response
    const updatedMember = await Member.findById(member._id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name");

    res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (err) {
    console.error(err);
    
    // Handle duplicate key error for nationalId
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

    // Prevent deleting parent with children
    const hasChildren = await Member.findOne({
      parent: member._id,
    });

    if (hasChildren) {
      return res.status(400).json({
        message: "Ntushobora gusiba umubyeyi ufite abana",
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