import client from "./client";

export const getAdminEvents = async () => {
  const response = await client.get("/api/admin/events");
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await client.get("/api/admin/users");
  return response.data;
};

export const getStats = async () => {
  const response = await client.get("/api/admin/stats");
  return response.data;
};

export const disableUser = async (id) => {
  const response = await client.patch(`/api/admin/users/${id}/disable`);
  return response.data;
};