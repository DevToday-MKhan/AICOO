import React, { useState, useEffect } from "react";

const Webhooks = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const fetchEvents = () => {
      fetch("/api/events")
        .then(res => res.json())
        .then(data => setEvents(data))
        .catch(() => setEvents([]));
    };

    fetchEvents();
    const intervalId = setInterval(fetchEvents, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const eventTypes = Array.from(
    new Set(events.map(event => event.event_type).filter(Boolean))
  );

  const filteredEvents = events.filter(event => {
    if (filter === "All") return true;
    return event.event_type === filter;
  });

  return (
    <div>
      <button onClick={() => setFilter("All")}>All</button>

      {eventTypes.map(type => (
        <button key={type} onClick={() => setFilter(type)}>
          {type}
        </button>
      ))}

      <ul>
        {filteredEvents.map((event, idx) => (
          <li key={idx}>{JSON.stringify(event)}</li>
        ))}
      </ul>
    </div>
  );
};

export default Webhooks;
