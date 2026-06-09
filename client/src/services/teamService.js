import api from "./api";

export const getTeams = async () => {
  const response = await api.get(
    "/teams"
  );

  return response.data;
};

export const createTeam = async (
  data
) => {
  const response = await api.post(
    "/teams",
    data
  );

  return response.data;
};