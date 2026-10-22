import client from "./client";

/**
 * Fetch the event collection for the Browse Events screen (FE 30).
 *
 * Agreed contract (BE 04):
 *   GET /api/events?search=&category=&from=&to=&status=APPROVED&page=&size=
 *
 * `params` is forwarded as query-string parameters. Empty/undefined values
 * are stripped so the request only carries the filters that are actually set.
 */
export const getEvents = async (params = {}) => {
  const query = Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
  );
  const response = await client.get("/api/events", { params: query });
  return response.data;
};

export const getEvent = async (id) => {
  const response = await client.get(`/api/events/${id}`);
  return response.data;
};

export const createEvent = async (dto) => {
  const response = await client.post("/api/events", dto);
  return response.data;
};

export const updateEvent = async (id, dto) => {
  const response = await client.put(`/api/events/${id}`, dto);
  return response.data;
};

export const cancelEvent = async (id) => {
  const response = await client.patch(`/api/events/${id}/cancel`);
  return response.data;
};

export const approveEvent = async (id) => {
  const response = await client.patch(`/api/events/${id}/approve`);
  return response.data;
};

export const disableEvent = async (id) => {
  const response = await client.patch(`/api/events/${id}/disable`);
  return response.data;
};