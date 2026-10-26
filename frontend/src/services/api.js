import axios from 'axios';

// Change this URL if your backend runs on a different port
const API_URL = 'http://localhost:5000/api/events'; 

export const getEvents = () => axios.get(API_URL);
export const createEvent = (eventData) => axios.post(API_URL, eventData);
export const updateEvent = (id, eventData) => axios.put(`${API_URL}/${id}`, eventData);
export const deleteEvent = (id) => axios.delete(`${API_URL}/${id}`);