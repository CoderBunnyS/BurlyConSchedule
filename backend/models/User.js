const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema(
  {
    by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    byName: { type: String, required: true },
    visibility: { type: String, enum: ["lead", "admin", "director"], default: "lead" },
    category: { type: String, enum: ["general", "kudos", "concern", "conduct"], default: "general" },
    text: { type: String, required: true, maxlength: 2000 }
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    fusionAuthId: { type: String, required: true, unique: true },
    preferredName: String,
    email: { type: String, required: true, unique: true },

    volunteerShifts: [
      {
        shift: { type: mongoose.Schema.Types.ObjectId, refPath: "volunteerShifts.refModel" },
        refModel: { type: String, enum: ["HourlyNeed", "FlexibleShift"], required: true },
        status: { type: String, enum: ["registered", "no-show"], default: "registered" }
      }
    ],

    totalHours: { type: Number, default: 0 },

    notes: { type: String },

    noShow: { type: Boolean, default: false },
    isRestricted: { type: Boolean, default: false },

    staffNotes: [NoteSchema],

  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
