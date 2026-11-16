const CLOUD_NAME = "dc5r74upy";
const UPLOAD_PRESET = "employee_upload";

type UploadOptions = {
  folder?: string; // e.g. "vendor_details/Ram_Travels"
  fileName?: string; // e.g. "panDoc"
};

export const uploadToCloudinary = async (
  file: File,
  { folder, fileName }: UploadOptions = {},
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  // detect resource type
  const isPdf = file.type === "application/pdf";
  const resourceType = isPdf ? "raw" : "image";

  if (folder) formData.append("folder", folder);

  if (fileName) {
    // raw files (PDF) ke public_id mein extension chahiye, warna link .pdf ke bina banta hai
    const ext = isPdf ? ".pdf" : "";
    formData.append("public_id", `${fileName}_${Date.now()}${ext}`);
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || "Cloudinary upload failed");
  }

  return data.secure_url;
};
