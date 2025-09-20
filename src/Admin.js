import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

function Admin() {
  const [statuses, setStatuses] = useState([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://birthdayparty-2025.s3.us-east-1.amazonaws.com/statuses.json")
      .then(res => res.json())
      .then(data => setStatuses(data))
      .catch(err => console.error(err));
  }, []);

  // Add new status
  const handleAdd = (e) => {
    e.preventDefault();
    if (!text) return;

    const now = new Date();
    const estDate = new Date(
      now.toLocaleString("en-US", { timeZone: "America/New_York" })
    );

    setStatuses([{ text, time: estDate.toISOString() }, ...statuses]);
    setText("");
  };

  // Update status text
  const handleUpdate = (index, value) => {
    const updated = [...statuses];
    updated[index].text = value;
    setStatuses(updated);
  };

  // Delete a single status
  const handleDelete = (index) => {
    const updated = statuses.filter((_, i) => i !== index);
    setStatuses(updated);
  };

  // Save statuses to S3
  const handleSave = async () => {
    try {
      await fetch("https://birthdayparty-2025.s3.us-east-1.amazonaws.com/statuses.json", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(statuses),
      });
      setMessage("Statuses uploaded successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to upload statuses.");
    }
  };

  return (
    <div style={{ minHeight: "100vh", padding: 40, background: "linear-gradient(135deg, #ffe4ec 0%, #fff 100%)" }}>
      <div className="container" style={{ maxWidth: 800, margin: "0 auto" }}>
        <h1 className="title">Admin Panel</h1>

        {/* Add New Status */}
        <h2>Add New Status</h2>
        <div>
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Status text"
            style={{ width: "100%", padding: 8, borderRadius: 6, marginBottom: 16 }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd(e)}
          />
          <button onClick={handleAdd} style={{ background: "#e75480", border: "none", color: "#fff", padding: "10px 24px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>Add Status</button>
        </div>

        {/* Edit / Delete Statuses */}
        <h2 style={{ marginTop: 40 }}>Edit Existing Posts</h2>
        {statuses.map((s, i) => (
          <div key={i} style={{ background: "#fff", padding: 16, borderRadius: 8, marginBottom: 16, boxShadow: "0 2px 6px rgba(0,0,0,0.1)" }}>
            <input
              type="text"
              value={s.text}
              onChange={e => handleUpdate(i, e.target.value)}
              style={{ width: "100%", padding: 8, borderRadius: 6, border: "1px solid #ccc" }}
            />
            <p style={{ fontSize: 12, color: "#666", marginTop: 8 }}>Timestamp: {new Date(s.time).toLocaleString()}</p>
            <button onClick={() => handleDelete(i)} style={{ background: "#b23a48", color: "#fff", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>Delete</button>
          </div>
        ))}

        {/* Save */}
        <button onClick={handleSave} style={{ background: "#409a3eff", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", fontWeight: 700, cursor: "pointer", marginTop: 16 }}>
          Save to S3
        </button>

        {message && <pre style={{ background: "#c6ffc8ff", color: "#414141ff", padding: 16, borderRadius: 8, marginTop: 24 }}>{message}</pre>}
      </div>
        <div style={{ bottom: 0, textAlign: "center", marginTop: 16, width: "100%" }}>
          <Link to="/" style={{ color: "#e75480", fontWeight: 700 }}>Go to main page</Link>
        </div>
    </div>
  );
}

export default Admin;
