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
    res.status(500).json({ message: "Failed to fetch events", error: err.message });
  }
});

// GET active event
router.get("/active", async (req, res) => {
  try {
    const event = await Event.findOne({ isActive: true });
    if (!event) return res.status(404).json({ message: "No active event found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch active event", error: err.message });
  }
});

// GET single event by ID
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch event", error: err.message });
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
    res.status(400).json({ message: "Failed to create event", error: err.message });
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
    res.status(400).json({ message: "Failed to update event", error: err.message });
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
    res.status(500).json({ message: "Failed to delete event", error: err.message });
  }
});

module.exports = router;