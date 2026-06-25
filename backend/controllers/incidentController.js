const Incident = require("../models/Incident");
const { analyzeIncident } = require("../services/openRouterService");

// 🔹 Create Incident
exports.createIncident = async (req, res, next) => {
  try {
    let aiAnalysis = "";
    let aiSeverity = "Low";

    try {
      aiAnalysis = await analyzeIncident(
        req.body.title,
        req.body.description,
        req.body.location
      );

      if (aiAnalysis.includes("SEVERITY: High")) {
        aiSeverity = "High";
      } else if (aiAnalysis.includes("SEVERITY: Medium")) {
        aiSeverity = "Medium";
      }
    } catch (error) {
      console.log("AI ERROR:", error);
    }

    let autoStatus = "Pending";
    if (aiAnalysis.includes("EMERGENCY_LEVEL: Critical")) {
      aiSeverity = "High";
      autoStatus = "Verified";
    }

    const incident = new Incident({
      ...req.body,
      severity: aiSeverity,
      status: autoStatus,
      image: req.file ? req.file.filename : "",
      user: req.user.id,
      aiAnalysis,
    });

    const savedIncident = await incident.save();

    const io = req.app.get("io");
    io.emit("newIncident", savedIncident);

    if (savedIncident.aiAnalysis.includes("EMERGENCY_LEVEL: Critical")) {
      io.emit("sosAlert", {
        title: savedIncident.title,
        location: savedIncident.location,
        severity: savedIncident.severity,
      });
    }

    if (savedIncident.title === "SOS Emergency" || savedIncident.severity === "High") {
      io.emit("sosAlert", savedIncident);
    }

    res.status(201).json(savedIncident);
  } catch (error) {
    next(error);
  }
};

// 🔹 Get All Incidents
exports.getIncidents = async (req, res, next) => {
  try {
    const { page = 1, limit = 5, severity, location, search } = req.query;
    const query = {};

    if (severity) query.severity = severity;
    if (location) query.location = { $regex: location, $options: "i" };
    if (search) query.title = { $regex: search, $options: "i" };

    const total = await Incident.countDocuments(query);
    const incidents = await Incident.find(query)
      .populate("user", "name email")
      .populate("comments.user", "name")
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

// 🔹 Get My Incidents
exports.getMyIncidents = async (req, res, next) => {
  try {
    const incidents = await Incident.find({ user: req.user.id })
      .populate("user", "name email")
      .populate("comments.user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ data: incidents });
  } catch (error) {
    next(error);
  }
};

// 🔹 Delete Incident
exports.deleteIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Incident.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Incident deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// 🔹 Update Incident
exports.updateIncident = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    if (incident.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    const updated = await Incident.findByIdAndUpdate(req.params.id, req.body, {
      returnDocument: "after",
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// 🔹 Update Status
exports.updateIncidentStatus = async (req, res, next) => {
  try {
    const incident = await Incident.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { returnDocument: "after" }
    );

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const io = req.app.get("io");
    io.emit("statusUpdated", incident);

    res.status(200).json(incident);
  } catch (error) {
    next(error);
  }
};

// 🔹 Toggle Upvote
exports.toggleUpvote = async (req, res, next) => {
  try {
    console.log("UPVOTE HIT - user:", req.user);

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const userId = req.user.id.toString();
    const alreadyUpvoted = incident.upvotes.map((id) => id.toString()).includes(userId);

    if (alreadyUpvoted) {
      incident.upvotes = incident.upvotes.filter((id) => id.toString() !== userId);
    } else {
      incident.upvotes.push(req.user.id);
    }

    await incident.save();

    res.status(200).json({
      upvotes: incident.upvotes.length,
      upvoted: !alreadyUpvoted,
    });
  } catch (error) {
    console.log("UPVOTE ERROR:", error);
    next(error);
  }
};

// 🔹 Add Comment
exports.addComment = async (req, res, next) => {
  try {
    console.log("COMMENT HIT - user:", req.user, "body:", req.body);

    const { text } = req.body;

    if (!text || text.trim().length < 1) {
      return res.status(400).json({ message: "Comment cannot be empty" });
    }

    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    incident.comments.push({ user: req.user.id, text: text.trim() });
    await incident.save();

    const updated = await Incident.findById(req.params.id).populate("comments.user", "name");

    res.status(201).json({ comments: updated.comments });
  } catch (error) {
    console.log("COMMENT ERROR:", error);
    next(error);
  }
};

// 🔹 Delete Comment
exports.deleteComment = async (req, res, next) => {
  try {
    const incident = await Incident.findById(req.params.id);

    if (!incident) {
      return res.status(404).json({ message: "Incident not found" });
    }

    const comment = incident.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.user.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await incident.save();

    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    next(error);
  }
};