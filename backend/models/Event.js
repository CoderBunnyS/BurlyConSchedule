const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },           // e.g. "BurlyCon 2026"
    year: { type: Number, required: true, unique: true },
    startDate: { type: Date, required: true },        // e.g. 2026-11-04
    endDate: { type: Date, required: true },          // e.g. 2026-11-08
    isActive: { type: Boolean, default: false },      // only one should be true at a time
  },
  { timestamps: true }
);

// Ensure only one active event at a time: when one is set active, deactivate others
eventSchema.pre("save", async function (next) {
  if (this.isActive && this.isModified("isActive")) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { $set: { isActive: false } }
    );
  }
  next();
});

module.exports = mongoose.model("Event", eventSchema);