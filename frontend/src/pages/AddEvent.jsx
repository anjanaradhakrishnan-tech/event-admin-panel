
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, CalendarDays, MapPin, Save } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/events";

const initialForm = {
  eventName: "",
  eventDescription: "",
  eventDate: "",
  venue: "",
};

export default function AddEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;

    async function fetchEvent() {
      try {
        const response = await axios.get(`${API}/${id}`);
        const event = response.data;

        setForm({
          eventName: event.eventName,
          eventDescription: event.eventDescription,
          eventDate: new Date(event.eventDate).toISOString().slice(0, 10),
          venue: event.venue,
        });
      } catch (err) {
        setError(err.response?.data?.message || "Could not load this event.");
      } finally {
        setLoading(false);
      }
    }

    fetchEvent();
  }, [id]);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (new Date(form.eventDate + "T00:00:00") < new Date(new Date().setHours(0, 0, 0, 0))) {
      setError("Please select today or a future date.");
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        await axios.put(`${API}/${id}`, form);
      } else {
        await axios.post(API, form);
      }

      navigate("/", {
        state: { message: isEditing ? "Event updated successfully!" : "Event created successfully!" }
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save the event. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <main className="page-container"><div className="empty-state">Loading event...</div></main>;
  }

  return (
    <main className="page-container form-page">
      <Link to="/" className="back-link"><ArrowLeft size={17} /> Back to Dashboard</Link>

      <section className="form-card">
        <div className="form-banner">
          <span className="form-banner-icon"><CalendarDays size={26} /></span>
          <span className="eyebrow">EVENT MANAGEMENT</span>
          <h1>{isEditing ? "Update Event" : "Create New Event"}</h1>
          <p>{isEditing ? "Edit the event information below." : "Fill in the details to add an event to your dashboard."}</p>
        </div>

        {error && <div className="error-message form-error">{error}</div>}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="field">
            <label htmlFor="eventName">Event Name *</label>
            <input id="eventName" name="eventName" value={form.eventName} onChange={handleChange} placeholder="e.g. Tech Innovation Summit" required maxLength={120} />
          </div>

          <div className="field">
            <label htmlFor="eventDescription">Event Description *</label>
            <textarea id="eventDescription" name="eventDescription" value={form.eventDescription} onChange={handleChange} placeholder="Describe the event, its purpose and highlights..." rows={4} required maxLength={2000} />
          </div>

          <div className="form-row">
            <div className="field">
              <label htmlFor="eventDate">Event Date *</label>
              <input id="eventDate" type="date" name="eventDate" value={form.eventDate} onChange={handleChange} min={new Date().toLocaleDateString("en-CA")} required />
            </div>

            <div className="field">
              <label htmlFor="venue">Venue *</label>
              <div className="input-with-icon">
                <MapPin size={18} />
                <input id="venue" name="venue" value={form.venue} onChange={handleChange} placeholder="e.g. Main Auditorium" required maxLength={200} />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <Link to="/" className="secondary-btn">Cancel</Link>
            <button type="submit" className="primary-btn" disabled={saving}>
              <Save size={18} /> {saving ? "Saving..." : isEditing ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
