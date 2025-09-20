import { HashRouter as Router, Routes, Route, Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import Admin from "./Admin";

function StatusPage() {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch("https://birthdayparty-2025.s3.us-east-1.amazonaws.com/statuses.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch statuses");
        return res.json();
      })
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.time) - new Date(a.time));
        setStatuses(sorted);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const formatESTDate = (dateString) => {
    const date = new Date(dateString);
    const timeOptions = { timeZone: "America/New_York", hour: "numeric", minute: "numeric", hour12: true };
    const time = new Intl.DateTimeFormat("en-US", timeOptions).format(date);

    const dateOptions = { timeZone: "America/New_York", weekday: "long", month: "long", day: "numeric" };
    const datePart = new Intl.DateTimeFormat("en-US", dateOptions).format(date);

    const day = date.toLocaleString("en-US", { timeZone: "America/New_York", day: "numeric" });
    const suffix = (d) => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1: return "st";
        case 2: return "nd";
        case 3: return "rd";
        default: return "th";
      }
    };
    const dateWithSuffix = datePart.replace(day, `${day}${suffix(Number(day))}`);

    const now = currentTime;
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const remainingMins = diffMins % 60;

    let relativeTime;
    if (diffMins < 1) relativeTime = "just now";
    else if (diffMins < 60) relativeTime = `${diffMins} min${diffMins === 1 ? '' : 's'} ago`;
    else if (diffHours < 24) {
      relativeTime = remainingMins === 0
        ? `${diffHours} hr${diffHours === 1 ? '' : 's'} ago`
        : `${diffHours} hr${diffHours === 1 ? '' : 's'} ${remainingMins} min${remainingMins === 1 ? '' : 's'} ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      relativeTime = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
    }

    return <>
      <div style={{marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1.5px solid #aaaaaaff", paddingBottom: 4, marginTop: -8}}>
        <span>{time}
          <span style={{fontWeight: 300, fontSize: "70%", fontStyle: "italic",}}>&nbsp;&nbsp;{dateWithSuffix}</span>
        </span> 
        <span style={{alignContent: "right", fontWeight: 300, fontStyle: "italic", fontSize: "70%"}}>({relativeTime})<br /></span>
      </div>
    </>;
  };

  // Function to calculate border color based on position in the list
  const getBorderColor = (index, totalCount) => {
    // Calculate opacity from 1 (brightest) at top to 0.2 (most faded) at bottom
    const opacity = Math.max(0.2, 1 - (index / Math.max(1, totalCount - 1)) * 0.8);
    return `rgba(231, 84, 128, ${opacity})`;
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div style={{ position: "sticky", top: 0, background: "#fff", boxShadow: "0 2px 8px rgba(231,84,128,0.07)", zIndex: 100, padding: "16px 0", textAlign: "center" }}>
        <span style={{ fontFamily: '"Dancing Script", "Pacifico", cursive', fontSize: "2.2rem", color: "#e75480", fontWeight: 700 }}>
          Cosette's Birthday Party
        </span>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", justifyContent: "center", padding: "32px 16px" }}>
        <div className="container" style={{ maxWidth: 600, width: "100%" }}>
          <p className="title">Status Updates</p>
          {loading && <span>Loading statuses...</span>}
          {error && <span style={{ color: "red" }}>{error}</span>}
          {!loading && !error && statuses.map((s, i) => (
            <div
              key={i}
              className="status-card"
              style={{ 
                background: "#fff", 
                padding: 16, 
                borderRadius: 12, 
                marginBottom: 16, 
                boxShadow: "0 4px 3px rgba(0, 0, 0, 0.2)",
                border: `2px solid ${getBorderColor(i, statuses.length)}`
              }}
            >
              <div className="status-time">{formatESTDate(s.time)}</div>
              <div className="status-text">{s.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <Link to="/admin" style={{ color: "#f083a4ff", fontWeight: 700 }}>
          Go to Admin Panel
        </Link>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StatusPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;