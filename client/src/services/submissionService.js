import api from "./api";

export const createSubmission =
  async (formData) => {
    const response =
      await api.post(
        "/submissions",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

    return response.data;
  };

export const getSubmissions =
  async () => {
    const response =
      await api.get(
        "/submissions"
      );

    return response.data;
  };

export const reviewSubmission =
  async (id, status) => {
    const response =
      await api.patch(
        `/submissions/${id}/review`,
        { status }
      );

    return response.data;
  };