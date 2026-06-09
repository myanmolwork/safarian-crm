import api from "./api";

export const getUsers = async () => {
  const response = await api.get(
    "/users"
  );

  return response.data;
};

export const createUser = async (
  data
) => {
  const response = await api.post(
    "/users",
    data
  );

  return response.data;
};
