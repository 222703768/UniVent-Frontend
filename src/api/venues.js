import client from "./client";

export const getVenues = async () => {
  const response = await client.get("/api/venues");
  return response.data;
};