import api from "./api";

export const getTasks = async () => {
  const response = await api.get(
    "/tasks"
  );

  return response.data;
};

export const createTask = async (
  data
) => {
  const response = await api.post(
    "/tasks",
    data
  );

  return response.data;
};

export const updateTaskStatus = async (
  taskId,
  status
) => {
  const response = await api.patch(
    `/tasks/${taskId}/status`,
    { status }
  );

  return response.data;
};
