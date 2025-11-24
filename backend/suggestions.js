import { getEvents } from "./webhooks.js";
import { getSettings } from "./settings.js";

const Suggestions = {
  getSuggestions() {
    const settings = getSettings();
    const events = getEvents();
    const totalEvents = events.length;
    const uniqueEventTypes = new Set(events.map(e => e.event_type)).size;

    return [
      "System running smoothly",
      `Total events: ${totalEvents}`,
      `Unique event types: ${uniqueEventTypes}`,
    ];
  },
};

export default Suggestions;
