const mongoose = require("mongoose");

const flexibleShiftSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  volunteersNeeded: {
    type: Number,
    required: true
  },
  volunteersRegistered: [{
    type: mongoose.Schema.Types.ObjectId,  
    ref: "User"
  }],
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model("FlexibleShift", flexibleShiftSchema);