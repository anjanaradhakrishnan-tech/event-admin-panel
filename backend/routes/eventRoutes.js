const express = require("express");
const mongoose = require("mongoose");
const Event = require("../models/Event");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const events = await Event.find().sort({ createdAt: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { eventName, eventDescription, eventDate, venue } = req.body;

    if (![eventName, eventDescription, eventDate, venue].every(
      value => typeof value === "string" && value.trim()
    )) {
      return res.status(400).json({
        message: "All event fields are required"
      });
    }

    if (Number.isNaN(Date.parse(eventDate))) {
      return res.status(400).json({ message: "Invalid event date" });
    }

    const event = await Event.create({
      eventName: eventName.trim(),
      eventDescription: eventDescription.trim(),
      eventDate: new Date(eventDate),
      venue: venue.trim()
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const { eventName, eventDescription, eventDate, venue } = req.body;

    if (![eventName, eventDescription, eventDate, venue].every(
      value => typeof value === "string" && value.trim()
    )) {
      return res.status(400).json({
        message: "All event fields are required"
      });
    }

    if (Number.isNaN(Date.parse(eventDate))) {
      return res.status(400).json({ message: "Invalid event date" });
    }

    const event = await Event.findByIdAndUpdate(
      req.params.id,
      {
        eventName: eventName.trim(),
        eventDescription: eventDescription.trim(),
        eventDate: new Date(eventDate),
        venue: venue.trim()
      },
      { new: true, runValidators: true }
    );

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Failed to update event" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await Event.findByIdAndDelete(req.params.id);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete event" });
  }
});

module.exports = router;