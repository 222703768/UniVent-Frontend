import client from "./client";

export const getAdminEvents = async (status = "ALL") => {
  const response = await client.get("/api/admin/events", { params: { status } });
  return response.data;
};

export const getAdminUsers = async (filters = {}) => {
  const response = await client.get("/api/admin/users", { params: filters });
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

export const approveOrganizer = async (id) => {
  const response = await client.patch(`/api/admin/users/${id}/approve`);
  return response.data;
};