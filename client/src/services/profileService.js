import api from "./api";

export const changePassword =
async (data) => {

  const response =
    await api.patch(
      "/auth/change-password",
      data
    );

  return response.data;
};