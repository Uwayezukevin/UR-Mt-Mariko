import Member from "../mongoschema/memberschema.js";
import Event from "../mongoschema/eventschema.js";

export const getDashboardStats = async (req, res) => {
  try {
    const totalMembers = await Member.countDocuments();
    const totalEvents = await Event.countDocuments();

    // Example: members by subgroup (adjust names to your DB)
    const subgroupStats = await Member.aggregate([
      {
        $lookup: {
          from: "subgroups",
          localField: "subgroup",
          foreignField: "_id",
          as: "subgroupData",
        },
      },
      { $unwind: "$subgroupData" },
      {
        $group: {
          _id: "$subgroupData.name",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      totalMembers,
      totalEvents,
      subgroupStats,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Dashboard stats error" });
  }
};
