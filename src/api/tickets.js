import client from "./client";

export const getTicketByBooking = async (bookingId) => {
  const response = await client.get(`/api/tickets/booking/${bookingId}`);
  return response.data;
};