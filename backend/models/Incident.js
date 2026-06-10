const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },




    status: {
  type: String,
  enum: ["Pending", "Verified", "Resolved"],
  default: "Pending",
},

    image: {
  type: String,
  default: "",
},

    // 🔥 NEW FIELD
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

aiAnalysis: {
  type: String,
  default: "",
},

  },
  { timestamps: true }
);

module.exports = mongoose.model("Incident", incidentSchema);