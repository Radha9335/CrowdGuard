const Incident =
  require("../models/Incident");

const express = require("express");

const router = express.Router();

router.post("/ask", async (req, res) => {
  try {

    const incidents =
      await Incident.find()
      .sort({ createdAt: -1 })
      .limit(20);

    let incidentText = "";

    incidents.forEach((incident) => {

      incidentText += `
Title: ${incident.title}

Location: ${incident.location}

Severity: ${incident.severity}

Status: ${incident.status}

Description:
${incident.description}

--------------------
`;

    });

    res.json({
      answer: incidentText,
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

module.exports = router;