const express = require("express");
const upload = require("../middleware/uploadMiddleware");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

console.log("INCIDENT ROUTES LOADED");

const {
  createIncident,
  getIncidents,
  deleteIncident,
  updateIncident,
  updateIncidentStatus,
} = require("../controllers/incidentController");

// Create
router.post(
  "/",
  protect,
  upload.single("image"),
  createIncident
);

// Get All
router.get("/", getIncidents);

// Delete
router.delete("/:id", protect, deleteIncident);

// Update
router.put("/:id", updateIncident);

router.put("/:id/status", updateIncidentStatus);

module.exports = router;