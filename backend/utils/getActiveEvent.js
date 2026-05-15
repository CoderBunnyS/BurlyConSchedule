const Event = require("../models/Event");

let cachedEvent = null;
let cachedAt = 0;
const CACHE_MS = 60 * 1000; // 1 minute

async function getActiveEvent() {
  const now = Date.now();
  if (cachedEvent && now - cachedAt < CACHE_MS) {
    return cachedEvent;
  }

  const event = await Event.findOne({ isActive: true });
  cachedEvent = event;
  cachedAt = now;
  return event;
}

function invalidateActiveEventCache() {
  cachedEvent = null;
  cachedAt = 0;
}

module.exports = { getActiveEvent, invalidateActiveEventCache };