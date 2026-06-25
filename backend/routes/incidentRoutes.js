const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const router = express.Router();

const {
  createIncident,
  getIncidents,
  getMyIncidents,
  deleteIncident,
  updateIncident,
  updateIncidentStatus,
  toggleUpvote,
  addComment,
  deleteComment,
} = require("../controllers/incidentController");

// Create
router.post("/", protect, upload.single("image"), createIncident);

// Get All
router.get("/", getIncidents);

// Get My Incidents
router.get("/my", protect, getMyIncidents);

// Delete
router.delete("/:id", protect, deleteIncident);

// Update
router.put("/:id", protect, updateIncident);

// Update Status (admin only)
router.put("/:id/status", protect, adminOnly, updateIncidentStatus);

// Upvote toggle
router.put("/:id/upvote", protect, toggleUpvote);

// Comments
router.post("/:id/comments", protect, addComment);
router.delete("/:id/comments/:commentId", protect, deleteComment);

module.exports = router;