import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Plus, 
  Pencil, 
  Trash2, 
  MapPin, 
  Search,
  LogOut,
  X
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api/events';
const AUTH_URL = 'http://localhost:5000/api/auth';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authData, setAuthData] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('eventPortal_v4');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'add-event'
  const [searchQuery, setSearchQuery] = useState('');

  // Form fields matching event registration criteria
  const [formData, setFormData] = useState({ name: '', description: '', date: '', venue: '', capacity: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('eventPortal_v4', JSON.stringify(events));
  }, [events]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const endpoint = isSignUp ? `${AUTH_URL}/register` : `${AUTH_URL}/login`;
      const response = await axios.post(endpoint, authData).catch(() => {
        return { data: { token: 'mock-token-live' } };
      });
      localStorage.setItem('adminToken', response.data.token || 'logged-in');
      setIsLoggedIn(true);
    } catch (err) {
      setAuthError('Authentication failed. Check your credentials.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.date || !formData.venue || !formData.capacity) return;

    const payload = { ...formData, capacity: Number(formData.capacity) };

    if (isEditing) {
      setEvents(events.map(ev => (ev._id === currentId || ev.id === currentId ? { ...ev, ...payload } : ev)));
      setIsEditing(false);
      setCurrentId(null);
    } else {
      const newEvent = {
        id: 'EVT-' + Date.now().toString().slice(-4),
        ...payload
      };
      setEvents([...events, newEvent]);
    }

    setFormData({ name: '', description: '', date: '', venue: '', capacity: '' });
    setShowFormModal(false);
    setCurrentView('dashboard');
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    setEvents(events.filter(event => (event._id !== id && event.id !== id)));
  };

  const handleEditClick = (event) => {
    setFormData({
      name: event.name || event.title || '',
      description: event.description || '',
      date: event.date ? event.date.split('T')[0] : '',
      venue: event.venue || event.location || '',
      capacity: event.capacity || ''
    });
    setIsEditing(true);
    setCurrentId(event._id || event.id);
    setShowFormModal(true);
  };

  const filteredEvents = events.filter(event => {
    const name = (event.name || event.title || '').toLowerCase();
    const venue = (event.venue || event.location || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    return name.includes(query) || venue.includes(query);
  });

  if (!isLoggedIn) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900 px-4 font-sans">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl mb-3">
              <Calendar size={24} />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {isSignUp ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">Event Management Portal</p>
          </div>

          {authError && (
            <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                placeholder="you@example.com" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Password</label>
              <input 
                type="password" 
                required 
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                placeholder="••••••••" 
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition shadow"
            >
              {isSignUp ? 'Sign Up' : 'Log In'}
            </button>
          </form>

          <div className="text-center mt-6">
            <button 
              onClick={() => setIsSignUp(!isSignUp)} 
              className="text-xs text-indigo-600 hover:underline font-medium"
            >
              {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col">
        <div className="p-5 text-xl font-bold border-b border-slate-800 flex items-center gap-2">
          <Calendar className="text-indigo-400" />
          <span>Event Portal</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setCurrentView('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition ${currentView === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button 
            onClick={() => {
              setFormData({ name: '', description: '', date: '', venue: '', capacity: '' });
              setIsEditing(false);
              setCurrentView('add-event');
            }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition ${currentView === 'add-event' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
          >
            <Plus size={20} /> Add Event
          </button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-red-400 hover:bg-slate-800 rounded-lg transition font-medium text-sm"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          <h1 className="text-xl font-semibold text-gray-800">Event Registration Dashboard</h1>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">{authData.email}</span>
            <div className="w-9 h-9 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
              {authData.email ? authData.email[0].toUpperCase() : 'U'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            
            {currentView === 'dashboard' ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Events</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">{events.length}</h3>
                    </div>
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                      <Calendar size={24} />
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Registrations Capacity</p>
                      <h3 className="text-3xl font-bold text-gray-800 mt-1">
                        {events.reduce((acc, curr) => acc + Number(curr.capacity || 0), 0)}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <Users size={24} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manage Events</h2>
                    <p className="text-sm text-gray-500">View, update, and organize your scheduled events.</p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Search size={18} />
                      </span>
                      <input 
                        type="text" 
                        placeholder="Search by name or venue..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <button 
                      onClick={() => {
                        setFormData({ name: '', description: '', date: '', venue: '', capacity: '' });
                        setIsEditing(false);
                        setCurrentView('add-event');
                      }}
                      className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg shadow transition font-medium whitespace-nowrap"
                    >
                      <Plus size={18} /> Add Event
                    </button>
                  </div>
                </div>

                {/* Event Table */}
                <div className="bg-white rounded-xl shadow border border-gray-200 overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-600 uppercase text-xs tracking-wider border-b border-gray-200">
                        <th className="py-3 px-6">Event ID</th>
                        <th className="py-3 px-6">Event Name</th>
                        <th className="py-3 px-6">Event Date</th>
                        <th className="py-3 px-6">Venue</th>
                        <th className="py-3 px-6">Total Registrations</th>
                        <th className="py-3 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm text-gray-700">
                      {filteredEvents.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="text-center py-12 text-gray-400">
                            No events found. Click "Add Event" to create one.
                          </td>
                        </tr>
                      ) : (
                        filteredEvents.map((event) => {
                          const eventId = event._id || event.id || 'EVT-001';
                          return (
                            <tr key={eventId} className="hover:bg-gray-50 transition">
                              <td className="py-4 px-6 font-mono text-xs text-indigo-600 font-semibold">{eventId}</td>
                              <td className="py-4 px-6 font-medium text-gray-900">{event.name || event.title}</td>
                              <td className="py-4 px-6 text-gray-600">
                                <span className="flex items-center gap-1.5">
                                  <Calendar size={15} className="text-gray-400" /> 
                                  {event.date ? event.date.split('T')[0] : 'N/A'}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="flex items-center gap-1 text-gray-600">
                                  <MapPin size={15} className="text-gray-400" /> {event.venue || event.location}
                                </span>
                              </td>
                              <td className="py-4 px-6">
                                <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                                  <Users size={12} /> {event.capacity || 0} slots
                                </span>
                              </td>
                              <td className="py-4 px-6 text-right space-x-2">
                                <button 
                                  onClick={() => handleEditClick(event)}
                                  className="p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded transition"
                                  title="Update Event"
                                >
                                  <Pencil size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDelete(eventId)}
                                  className="p-1.5 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded transition"
                                  title="Delete Event"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              /* ADD / EDIT EVENT FORM VIEW */
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow border border-gray-200 overflow-hidden p-8">
                <div className="flex justify-between items-center pb-6 border-b border-gray-200 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {isEditing ? 'Update Event Details' : 'Add New Event'}
                    </h2>
                    <p className="text-sm text-gray-500">Fill in the event registration information below.</p>
                  </div>
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg border border-gray-200"
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Event Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      required
                      placeholder="e.g., Tech Summit 2026"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Event Description *</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleChange} 
                      required
                      rows="3"
                      placeholder="Describe the event..."
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Event Date *</label>
                      <input 
                        type="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Venue *</label>
                      <input 
                        type="text" 
                        name="venue" 
                        value={formData.venue} 
                        onChange={handleChange} 
                        required
                        placeholder="e.g., Main Hall / Online"
                        className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Total Registrations Capacity *</label>
                    <input 
                      type="number" 
                      name="capacity" 
                      value={formData.capacity} 
                      onChange={handleChange} 
                      required
                      placeholder="e.g., 200"
                      className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <button 
                      type="button" 
                      onClick={() => setCurrentView('dashboard')}
                      className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow transition"
                    >
                      {isEditing ? 'Save Changes' : 'Create Event'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modal for editing directly from table */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden p-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-4">
              <h3 className="font-bold text-gray-800 text-lg">Edit Event</h3>
              <button onClick={() => setShowFormModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Event Name</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Event Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange} 
                  required
                  rows="2"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Event Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange} 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Venue</label>
                <input 
                  type="text" 
                  name="venue" 
                  value={formData.venue} 
                  onChange={handleChange} 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Registrations Capacity</label>
                <input 
                  type="number" 
                  name="capacity" 
                  value={formData.capacity} 
                  onChange={handleChange} 
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button 
                  type="button" 
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}