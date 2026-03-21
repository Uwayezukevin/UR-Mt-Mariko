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
      spouse, // ✅ added
      accessibility,
      accessibilityNotes,
      isActive,
    } = req.body;

    const updatedCategory = category ?? member.category;
    const updatedParent = parent !== undefined ? parent : member.parent;

    if (updatedCategory !== "adult" && !updatedParent) {
      return res.status(400).json({
        message: `${updatedCategory === "child" ? "Umwana" : "Urubyiruko"} agomba kugira umubyeyi`,
      });
    }

    // ✅ Ugushyingirwa validation
    const updatedSakraments = sakraments ?? member.sakraments;
    const updatedSpouse = spouse !== undefined ? spouse : member.spouse;

    if (updatedSakraments?.includes(UGUSHYINGIRWA_ID)) {
      if (!updatedSpouse) {
        return res.status(400).json({
          message: "Ugomba gushyiraho uwo mwashyingiranywe",
        });
      }

      if (updatedSpouse.toString() === member._id.toString()) {
        return res.status(400).json({
          message: "Ntushobora kwishyingira",
        });
      }

      const spouseExists = await Member.findById(updatedSpouse);
      if (!spouseExists) {
        return res.status(400).json({
          message: "Uwo mwashyingiranywe ntabaho",
        });
      }
    }

    // Apply updates
    if (fullName !== undefined) member.fullName = fullName;
    if (category !== undefined) member.category = category;
    if (nationalId !== undefined) member.nationalId = nationalId;
    if (dateOfBirth !== undefined) member.dateOfBirth = dateOfBirth;
    if (phone !== undefined) member.phone = phone;
    if (gender !== undefined) member.gender = gender;
    if (subgroup !== undefined) member.subgroup = subgroup;
    if (sakraments !== undefined) member.sakraments = sakraments;
    if (spouse !== undefined) member.spouse = spouse; // ✅ added
    if (isActive !== undefined) member.isActive = isActive;

    // Accessibility logic (unchanged)
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
          if (isActive === undefined) member.isActive = true;
        }
      }
    } else if (accessibilityNotes !== undefined) {
      member.accessibilityNotes = accessibilityNotes;
    }

    member.parent =
      updatedCategory !== "adult" ? updatedParent : updatedParent || null;

    await member.save();

    // ✅ Auto-link spouse
    if (updatedSpouse) {
      await Member.findByIdAndUpdate(updatedSpouse, {
        spouse: member._id,
      });
    }

    const updatedMember = await Member.findById(member._id)
      .populate("parent", "fullName category")
      .populate("subgroup", "name")
      .populate("sakraments", "name")
      .populate("spouse", "fullName"); // ✅ added

    res.status(200).json({
      message: "Member updated successfully",
      member: updatedMember,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000 && err.keyPattern?.nationalId) {
      return res.status(400).json({
        message: "Indangamuntu isanzwe ikoreshwa",
      });
    }

    res.status(500).json({ message: "Server error" });
  }
};