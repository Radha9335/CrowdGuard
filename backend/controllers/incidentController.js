const Incident = require("../models/Incident");

// 🔹 Create Incident
exports.createIncident = async (req, res, next) => {
  try {
    const incident = new Incident({
  ...req.body,
  image: req.file ? req.file.filename : "",
  user: req.user.id,
});
    const savedIncident = await incident.save();

const io = req.app.get("io");

io.emit("newIncident", savedIncident);

if (
  savedIncident.title === "SOS Emergency" ||
  savedIncident.severity === "High"
) {
  io.emit("sosAlert", savedIncident);
}

res.status(201).json(savedIncident);
  } catch (error) {
    next(error);
  }
};

// 🔹 Get All Incidents (With Pagination+Filtering)
exports.getIncidents = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, severity, location, search } = req.query;

    const query = {};

    if (severity) {
      query.severity = severity;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const total = await Incident.countDocuments(query);

    const incidents = await Incident.find(query)
      .populate("user", "name email") // 🔥 THIS IS NEW
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      data: incidents,
    });

  } catch (error) {
    next(error);
  }
};

// 🔹 Delete Incident
exports.deleteIncident = async (req, res, next) => {
  try {


    const incident = await Incident.findById(req.params.id);

if (!incident) {
  return res.status(404).json({
    message: "Incident not found",
  });
}

if (
  incident.user.toString() !== req.user.id &&
  req.user.role !== "admin"
) {
  return res.status(403).json({
    message: "Not authorized",
  });
}



    const deleted = await Incident.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    res.status(200).json({
      message: "Incident deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
// 🔹 Update Incident
exports.updateIncident = async (req, res, next) => {
  try {


const incident = await Incident.findById(req.params.id);

if (!incident) {
  return res.status(404).json({
    message: "Incident not found",
  });
}

if (
  incident.user.toString() !== req.user.id &&
  req.user.role !== "admin"
) {
  return res.status(403).json({
    message: "Not authorized",
  });
}



    const updated = await Incident.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
  returnDocument: "after",
}
    );

    if (!updated) {
      res.status(404);
      throw new Error("Incident not found");
    }

    res.status(200).json(updated);

  } catch (error) {
    next(error);
  }
};


// 🔹 Update Incident Status
exports.updateIncidentStatus = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      {
        status: req.body.status,
      },
      {
  returnDocument: "after",
}
    );

    if (!incident) {
      return res.status(404).json({
        message: "Incident not found",
      });
    }

    // 🔥 NEW
    const io = req.app.get("io");
    io.emit("statusUpdated", incident);

    res.status(200).json(incident);
  } catch (error) {
    next(error);
  }
};