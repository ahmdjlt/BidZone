import { apiFetch } from "@/lib/api/client";

interface UploadImageResponse {
  url: string;
}

export async function uploadAuctionImage(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiFetch<UploadImageResponse>("/api/uploads/image", {
    method: "POST",
    body: formData,
  });

  return response.url;
}
