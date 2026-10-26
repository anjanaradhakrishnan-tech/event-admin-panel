
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { CalendarDays, MapPin, Users, Pencil, Trash2, Plus, RefreshCw } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/events";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadEvents() {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API);
      setEvents(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load events. Check the backend.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvents();
  }, []);

  async function deleteEvent(id, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;

    try {
      await axios.delete(`${API}/${id}`);
      setEvents((current) => current.filter((event) => event._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete event.");
    }
  }

  const totalRegistrations = events.reduce(
    (sum, event) => sum + (event.totalRegistrations || 0), 0
  );

  function formatDate(date) {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <main className="page-container">
      <section className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Event Dashboard</h1>
          <p>Manage your events and track registrations in one place.</p>
        </div>

        <Link to="/add-event" className="primary-btn">
          <Plus size={18} /> Create Event
        </Link>
      </section>

      <section className="stats-grid">
        <article className="stat-card">
          <span className="stat-icon purple"><CalendarDays /></span>
          <div><p>Total Events</p><h2>{events.length}</h2></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon blue"><Users /></span>
          <div><p>Total Registrations</p><h2>{totalRegistrations}</h2></div>
        </article>
        <article className="stat-card">
          <span className="stat-icon orange"><MapPin /></span>
          <div><p>Upcoming Events</p><h2>{events.filter(
            (event) => new Date(event.eventDate) >= new Date(new Date().setHours(0, 0, 0, 0))
          ).length}</h2></div>
        </article>
      </section>

      <section className="table-card">
        <div className="table-heading">
          <div>
            <h2>All Events</h2>
            <p>View, update, and manage your event records.</p>
          </div>
          <button className="icon-btn" onClick={loadEvents} title="Refresh events">
            <RefreshCw size={18} />
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="empty-state">Loading events...</div>
        ) : events.length === 0 && !error ? (
          <div className="empty-state">
            <CalendarDays size={38} />
            <h3>No events yet</h3>
            <p>Create your first event to see it here.</p>
            <Link to="/add-event" className="primary-btn">
              <Plus size={18} /> Add First Event
            </Link>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Event Name</th>
                  <th>Event Date</th>
                  <th>Venue</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event._id}>
                    <td><span className="id-label">{event._id.slice(-6).toUpperCase()}</span></td>
                    <td>
                      <div className="event-name">{event.eventName}</div>
                      <div className="event-description">{event.eventDescription}</div>
                    </td>
                    <td>{formatDate(event.eventDate)}</td>
                    <td><span className="venue-cell"><MapPin size={15} />{event.venue}</span></td>
                    <td><span className="registration-count"><Users size={15} />{event.totalRegistrations || 0}</span></td>
                    <td>
                      <div className="action-group">
                        <Link to={`/edit-event/${event._id}`} className="action-btn edit-btn" title="Update event">
                          <Pencil size={16} /> Edit
                        </Link>
                        <button className="action-btn delete-btn" onClick={() => deleteEvent(event._id, event.eventName)} title="Delete event">
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <p className="footer-note">EventHub Admin · Event management made simple</p>
    </main>
  );
}
