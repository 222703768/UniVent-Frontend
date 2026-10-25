import client from "./client";

export const getMyEvents = async (status) => {
  const response = await client.get("/api/organizers/me/events", {
    params: status ? { status } : undefined,
  });
  return response.data;
};

export const getEventRegistrations = async (eventId) => {
  const response = await client.get(`/api/events/${eventId}/bookings`);
  return response.data;
};
