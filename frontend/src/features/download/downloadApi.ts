import axiosInstance from "@/lib/axioInstance";

interface DownloadParams {
  type: string;
  month: string;
  year: string;
}

export const getDownloadReportAPI = async ({
  type,
  month,
  year,
}: DownloadParams) => {
  const response = await axiosInstance.get("/download/download", {
    params: {
      type,
      month,
      year,
    },
  });

  return response.data;
};
