import client from "./client";


/**
 * Registers a new Student or Organizer.
 * @param {Object} dto - RegisterRequest fields
 * @returns {Object} AuthResponse { token, role, userId, name, email, accountStatus }
 */
export const register = async (dto) => {
  const response = await client.post("/api/auth/register", dto);
  return response.data;
};

/**
 * Logs in an existing user.
 * @param {Object} dto - { email, password }
 * @returns {Object} AuthResponse { token, role, userId, name, email, accountStatus }
 */
export const loginUser = async (dto) => {
  const response = await client.post("/api/auth/login", dto);
  return response.data;
};