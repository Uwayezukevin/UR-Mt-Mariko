import subgroups from "../mongoschema/subgroupsSchema.js";
// GET all subgroups
export const getAllSubgroups = async (req, res) => {
  try {
    const Allsubgroups = await subgroups.find().select("_id name");
    res.status(200).json(Allsubgroups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching subgroups" });
  }
};
