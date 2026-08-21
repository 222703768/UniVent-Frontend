import client from "./client";

export const createBooking = async (eventId) => {
  const response = await client.post("/api/bookings", { eventId });
  return response.data;
};

export const getMyBookings = async () => {
  const response = await client.get("/api/bookings/my");
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await client.patch(`/api/bookings/${id}/cancel`);
  return response.data;
};