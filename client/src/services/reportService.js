import api from "./api";

export const submitReport =
async (data) => {

  const response =
  await api.post(
    "/reports",
    data
  );

  return response.data;
};

export const getReports =
async () => {

  const response =
  await api.get(
    "/reports"
  );

  return response.data;
};