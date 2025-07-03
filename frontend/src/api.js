import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
});

export const getRooms = () => API.get('/rooms');
export const getRoom = (id) => API.get(`/rooms/${id}`);
export const checkIn = (id, data) => API.post(`/rooms/${id}/checkin`, data);
export const checkOut = (id) => API.post(`/rooms/${id}/checkout`);
export const updateGuest = (id, data) => API.patch(`/rooms/${id}/guest`, data);
export const getAllGuests = () => API.get('/rooms/all-guests');
export const deleteGuestHistory = (roomNumber, historyId) =>
  API.delete(`/rooms/${roomNumber}/history/${historyId}`); 