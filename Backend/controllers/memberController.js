import Member from '../mongoschema/memberschema.js'

// CREATE MEMBER
export const createMember = async (req, res) => {
  try {
    const { fullName, category, nationalId, dateOfBirth, phone, parent, gender,subgroup,sakraments } = req.body;

    // Extra validation for children
    if (category === "child" && !parent) {
      return res.status(400).json({ message: "Child must have a parent" });
    }
    if (category !== "child" && parent) {
      return res.status(400).json({ message: "Only children can have a parent" });
    }

    const member = await Member.create({
      fullName,
      category,
      nationalId,
      dateOfBirth,
      phone,
      parent: parent || null,
      gender,
      subgroup,
      sakraments: sakraments || [],
    });

    res.status(201).json({ message: "Member created successfully", member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// READ ALL MEMBERS
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
      .select("-nationalId"); // 🔐 hide nationalId

    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// READ MEMBER BY ID
export const getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id)
      .populate("parent", "fullName category")
      .populate("subgroup" , "name")
      .populate("sakraments");

    if (!member) return res.status(404).json({ message: "Member not found" });

    res.status(200).json(member);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE MEMBER
export const updateMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const { fullName, category, nationalId, dateOfBirth, phone, parent, gender,subgroup,sakraments } = req.body;

    // Check child-parent rules
    if (category === "child" && !parent) {
      return res.status(400).json({ message: "Child must have a parent" });
    }
    if (category !== "child" && parent) {
      return res.status(400).json({ message: "Only children can have a parent" });
    }

    // Update fields
    member.fullName = fullName || member.fullName;
    member.category = category || member.category;
    member.nationalId = nationalId || member.nationalId;
    member.dateOfBirth = dateOfBirth || member.dateOfBirth;
    member.phone = phone || member.phone;
    member.parent = parent || null;
    member.gendrer = gender || member.gender;
    member.subgroup = subgroup || member.subgroup;
    member.sakraments = sakraments || member.sakraments;

    await member.save();

    res.status(200).json({ message: "Member updated", member });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE MEMBER
export const deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: "Member not found" });

    const hasChildren = await Member.findOne({ parent: member._id });
    if (hasChildren) {
      return res
        .status(400)
        .json({ message: "Cannot delete a parent who has children registered" });
    }

    await Member.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
