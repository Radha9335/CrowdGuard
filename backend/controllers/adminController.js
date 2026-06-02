const User = require("../models/User");
const Incident = require("../models/Incident");

exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalIncidents = await Incident.countDocuments();

    const highSeverity = await Incident.countDocuments({ severity: "High" });
    const mediumSeverity = await Incident.countDocuments({ severity: "Medium" });
    const lowSeverity = await Incident.countDocuments({ severity: "Low" });

    res.status(200).json({
      totalUsers,
      totalIncidents,
      highSeverity,
      mediumSeverity,
      lowSeverity
    });

  } catch (error) {
    next(error);
  }
};