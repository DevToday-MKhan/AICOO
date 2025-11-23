import React, { useState, useEffect } from "react";

const Settings = () => {
  const [storeName, setStoreName] = useState("");
  const [notificationEmail, setNotificationEmail] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then(res => res.json())
      .then(data => {
        setStoreName(data.storeName || "");
        setNotificationEmail(data.notificationEmail || "");
      })
      .catch(() => {
        setStoreName("");
        setNotificationEmail("");
      });
  }, []);

  const handleSave = () => {
    fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        storeName,
        notificationEmail
      })
    });
  };

  return (
    <div>
      <h2>AICOO Settings</h2>

      <div>
        <label>
          Store Name:
          <input
            type="text"
            value={storeName}
            onChange={e => setStoreName(e.target.value)}
          />
        </label>
      </div>

      <div>
        <label>
          Notification Email:
          <input
            type="text"
            value={notificationEmail}
            onChange={e => setNotificationEmail(e.target.value)}
          />
        </label>
      </div>

      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default Settings;
