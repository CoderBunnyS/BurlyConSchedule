const express = require("express");
const router = express.Router();
const Event = require("../models/Event");
const { invalidateActiveEventCache } = require("../utils/getActiveEvent");

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ year: -1 });
    res.json(events);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch events", error: err.message });
  }
});

// GET active event
router.get("/active", async (req, res) => {
  try {
    const event = await Event.findOne({ isActive: true });
    if (!event)
      return res.status(404).json({ message: "No active event found" });
    res.json(event);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch active event", error: err.message });
  }
});

// GET single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch event", error: err.message });
  }
});

// POST create new event
router.post("/", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    invalidateActiveEventCache();
    res.status(201).json(event);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to create event", error: err.message });
  }
});

// PATCH update event
router.patch("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    Object.assign(event, req.body);
    await event.save(); // triggers the pre-save hook for isActive
    invalidateActiveEventCache();
    res.json(event);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Failed to update event", error: err.message });
  }
});

// DELETE event
router.delete("/:id", async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    invalidateActiveEventCache();
    res.json({ message: "Event deleted", event });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete event", error: err.message });
  }
});

// POST clone shifts from one event to another
router.post("/:targetId/clone-from/:sourceId", async (req, res) => {
  try {
    const FlexibleShift = require("../models/FlexibleShift");

    const sourceEvent = await Event.findById(req.params.sourceId);
    const targetEvent = await Event.findById(req.params.targetId);

    if (!sourceEvent)
      return res.status(404).json({ message: "Source event not found" });
    if (!targetEvent)
      return res.status(404).json({ message: "Target event not found" });

    if (sourceEvent._id.equals(targetEvent._id)) {
      return res.status(400).json({ message: "Source and target must differ" });
    }

    // Get all source shifts
    const sourceShifts = await FlexibleShift.find({ eventId: sourceEvent._id });
    if (sourceShifts.length === 0) {
      return res
        .status(400)
        .json({ message: "Source event has no shifts to clone" });
    }

    // Check if target already has shifts (safety)
    const existingTargetCount = await FlexibleShift.countDocuments({
      eventId: targetEvent._id,
    });
    if (existingTargetCount > 0 && !req.body.force) {
      return res.status(409).json({
        message: `Target event already has ${existingTargetCount} shifts.`,
        existingCount: existingTargetCount,
        requiresForce: true,
      });
    }

    // Date math: find the offset that aligns days-of-week
    // Anchor on the start dates of both events
    const sourceStart = new Date(sourceEvent.startDate);
    const targetStart = new Date(targetEvent.startDate);

    // Calculate the difference in days, then round to nearest 7
    // so that the day-of-week aligns
    const msPerDay = 24 * 60 * 60 * 1000;
    const rawDiffDays = Math.round((targetStart - sourceStart) / msPerDay);
    const sourceDOW = sourceStart.getUTCDay();
    const targetDOW = targetStart.getUTCDay();
    const dowShift = (targetDOW - sourceDOW + 7) % 7;
    // Final offset: shift in days from source date → target date that preserves DOW
    const dayOffset =
      rawDiffDays +
      (dowShift === 0 ? 0 : dowShift) -
      (((rawDiffDays % 7) + 7) % 7);

    // Build new shifts
    const newShifts = sourceShifts.map((shift) => {
      const oldDate = new Date(shift.date + "T00:00:00Z");
      const newDate = new Date(oldDate.getTime() + dayOffset * msPerDay);
      const newDateStr = newDate.toISOString().split("T")[0];

      return {
        eventId: targetEvent._id,
        date: newDateStr,
        role: shift.role,
        startTime: shift.startTime,
        endTime: shift.endTime,
        volunteersNeeded: shift.volunteersNeeded,
        volunteersRegistered: [],
        notes: shift.notes,
        reminderSent: false,
      };
    });

    const created = await FlexibleShift.insertMany(newShifts);

    res.json({
      message: `Cloned ${created.length} shifts from ${sourceEvent.name} to ${targetEvent.name}`,
      dayOffset,
      shiftsCreated: created.length,
    });
  } catch (err) {
    console.error("Clone error:", err);
    res
      .status(500)
      .json({ message: "Failed to clone shifts", error: err.message });
  }
});

module.exports = router;
