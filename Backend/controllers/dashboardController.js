import Member from "../mongoschema/memberschema.js";
import Event from "../mongoschema/eventschema.js";
import Report from "../mongoschema/reportSchema.js";
import Attendance from "../mongoschema/attendanceSchema.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Run independent queries in parallel instead of sequentially
    const [
      totalMembers,
      activeMembers,
      totalEvents,
      upcomingEvents,
      totalReports,
      attendanceRecords,
      familyCount,
      subgroupStats,
      categoryStats,
    ] = await Promise.all([
      Member.countDocuments(),
      Member.countDocuments({ isActive: true }),
      Event.countDocuments(),
      Event.countDocuments({ date: { $gte: new Date() } }),
      Report.countDocuments(),
      Attendance.countDocuments(),
      // A "family" is a distinct parent that has at least one child linked.
      Member.aggregate([
        { $match: { parent: { $ne: null } } },
        { $group: { _id: "$parent" } },
        { $count: "count" },
      ]),
      // Use $lookup with preserveNullAndEmptyArrays so members without a
      // subgroup are counted under "Nta itsinda" rather than dropped.
      Member.aggregate([
        {
          $lookup: {
            from: "subgroups",
            localField: "subgroup",
            foreignField: "_id",
            as: "subgroupData",
          },
        },
        {
          $unwind: {
            path: "$subgroupData",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { $ifNull: ["$subgroupData.name", "Nta itsinda"] },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
      ]),
      Member.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      totalMembers,
      activeMembers,
      totalEvents,
      upcomingEvents,
      totalReports,
      attendanceRecords,
      totalFamilies: familyCount[0]?.count || 0,
      subgroupStats,
      categoryStats,
    });
  } catch (err) {
    console.error("getDashboardStats error:", err.message);
    res.status(500).json({ message: "Dashboard stats error" });
  }
};
