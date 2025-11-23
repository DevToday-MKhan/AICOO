import React, { useState, useEffect } from "react";

const sectionStyle = {
  border: "1px solid #ccc",
  padding: "12px",
  marginBottom: "12px",
  borderRadius: "6px"
};

const Dashboard = () => {
  const [count, setCount] = useState(0);
  const [events, setEvents] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    fetch("/api/events")
      .then(res => res.json())
      .then(data => {
        setCount(data.length);
        setEvents(data);
      })
      .catch(() => {
        setCount(0);
        setEvents([]);
      });

    fetch("/api/suggestions")
      .then(res => res.json())
      .then(data => setSuggestions(data))
      .catch(() => setSuggestions([]));
  }, []);

  const lastFiveEvents = events.slice(-5);

  return (
    <div>
      <div style={sectionStyle}>
        <h3>Event Summary</h3>
        Total Webhook Events: {count}
      </div>

      <div style={sectionStyle}>
        <h3>Recent Events</h3>
        <ul>
          {lastFiveEvents.map((event, idx) => (
            <li key={idx}>{JSON.stringify(event)}</li>
          ))}
        </ul>
      </div>

      <div style={sectionStyle}>
        <h3>AI COO Suggestions</h3>
        <ul>
          {suggestions.map((s, idx) => (
            <li key={idx}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
