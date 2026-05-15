import React, { useCallback, useEffect, useState } from "react";
import Header from "./Header";
import { hasRole } from "../utils/authUtils";
import "../styles/adminEvents.css";

const API_BASE = process.env.REACT_APP_API_BASE;

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [cloneState, setCloneState] = useState(null); // { targetEvent, sourceEventId }
  const [busy, setBusy] = useState(false);

  const isAdmin = hasRole("Admin");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setEvents(data);
      setError(null);
    } catch (e) {
      setError(e.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSetActive = async (event) => {
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${event._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadEvents();
    } catch (e) {
      alert(`Failed to set active: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    const form = e.target;
    const payload = {
      name: form.name.value.trim(),
      year: parseInt(form.year.value, 10),
      startDate: form.startDate.value,
      endDate: form.endDate.value,
      isActive: form.isActive.checked,
    };
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `HTTP ${res.status}`);
      }
      form.reset();
      setShowNewForm(false);
      await loadEvents();
    } catch (e) {
      alert(`Failed to create event: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteEvent = async (event) => {
    if (!window.confirm(`Delete "${event.name}"? This does NOT delete its shifts.`)) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${event._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await loadEvents();
    } catch (e) {
      alert(`Failed to delete: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const openCloneDialog = (targetEvent) => {
    setCloneState({ targetEvent, sourceEventId: "" });
  };

  const closeCloneDialog = () => setCloneState(null);

  const handleClone = async (force = false) => {
    if (!cloneState?.sourceEventId) {
      alert("Pick a source event first");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/events/${cloneState.targetEvent._id}/clone-from/${cloneState.sourceEventId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ force }),
        }
      );
      const data = await res.json();
      if (res.status === 409 && data.requiresForce) {
        const proceed = window.confirm(
          `${data.message}\n\nClone anyway? New shifts will be added alongside existing ones.`
        );
        if (proceed) return handleClone(true);
        return;
      }
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
      alert(data.message);
      closeCloneDialog();
    } catch (e) {
      alert(`Clone failed: ${e.message}`);
    } finally {
      setBusy(false);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString(undefined, {
      month: "short", day: "numeric", year: "numeric", timeZone: "UTC",
    });
  };

  if (!isAdmin) {
    return (
      <div className="modern-page-container">
        <Header />
        <div className="modern-content-wrapper">
          <p>You don't have permission to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="modern-page-container">
      <Header />

      <div className="modern-header-section">
        <div className="modern-header-content">
          <h1 className="modern-page-title">Manage Events</h1>
          <p className="modern-page-subtitle">
            Create event years and clone last year's shifts to save time.
          </p>
        </div>
      </div>

      <div className="modern-content-wrapper">
        <div className="modern-add-shift-section">
          <button
            className="modern-primary-button"
            onClick={() => setShowNewForm((v) => !v)}
            disabled={busy}
          >
            {showNewForm ? "Cancel" : "➕ New Event"}
          </button>

          {showNewForm && (
            <div className="modern-add-form-container">
              <div className="modern-form-card">
                <form className="shift-form" onSubmit={handleCreateEvent}>
                  <h2>Create New Event</h2>

                  <label>Name:</label>
                  <input name="name" placeholder="BurlyCon 2027" required />

                  <label>Year:</label>
                  <input name="year" type="number" min="2020" max="2099" required />

                  <label>Start Date:</label>
                  <input name="startDate" type="date" required />

                  <label>End Date:</label>
                  <input name="endDate" type="date" required />

                  <label>
                    <input name="isActive" type="checkbox" /> Set as active event
                  </label>

                  <button type="submit" disabled={busy}>Create Event</button>
                </form>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="modern-loading-state">
            <div className="modern-loading-spinner" />
            <p>Loading events…</p>
          </div>
        ) : error ? (
          <p className="modern-error">{error}</p>
        ) : events.length === 0 ? (
          <p>No events yet. Create one above.</p>
        ) : (
          <div className="event-list">
            {events.map((ev) => (
              <div key={ev._id} className={`event-card ${ev.isActive ? "active" : ""}`}>
                <div className="event-card-header">
                  <h3>
                    {ev.name}
                    {ev.isActive && <span className="event-active-badge">ACTIVE</span>}
                  </h3>
                  <p className="event-dates">
                    {formatDate(ev.startDate)} – {formatDate(ev.endDate)}
                  </p>
                </div>

                <div className="event-card-actions">
                  {!ev.isActive && (
                    <button
                      className="event-action-button"
                      onClick={() => handleSetActive(ev)}
                      disabled={busy}
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    className="event-action-button"
                    onClick={() => openCloneDialog(ev)}
                    disabled={busy}
                  >
                    Clone Shifts Into This Event
                  </button>
                  <button
                    className="event-action-button danger"
                    onClick={() => handleDeleteEvent(ev)}
                    disabled={busy}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {cloneState && (
          <div className="clone-modal-backdrop" onClick={closeCloneDialog}>
            <div className="clone-modal" onClick={(e) => e.stopPropagation()}>
              <h3>Clone shifts into "{cloneState.targetEvent.name}"</h3>
              <p>Dates will shift forward by 52 weeks per year so days-of-week align.</p>

              <label>Source event:</label>
              <select
                value={cloneState.sourceEventId}
                onChange={(e) =>
                  setCloneState({ ...cloneState, sourceEventId: e.target.value })
                }
              >
                <option value="">-- Select source event --</option>
                {events
                  .filter((ev) => ev._id !== cloneState.targetEvent._id)
                  .map((ev) => (
                    <option key={ev._id} value={ev._id}>
                      {ev.name}
                    </option>
                  ))}
              </select>

              <div className="clone-modal-actions">
                <button onClick={closeCloneDialog} disabled={busy}>Cancel</button>
                <button
                  className="modern-primary-button"
                  onClick={() => handleClone(false)}
                  disabled={busy || !cloneState.sourceEventId}
                >
                  {busy ? "Cloning…" : "Clone Shifts"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}