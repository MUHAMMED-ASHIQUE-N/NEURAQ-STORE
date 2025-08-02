export async function uploadImageToCloudflare(file: File): Promise<string> {
  const accountId = "a26ad94e691df93fea801ec5e167209f";
  const apiToken = "cJgt4bwIGNtkQPiezULG3HypS9oSUJec-2Z9GgK0";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("requireSignedURLs", "false"); // Optional

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiToken}`,
      },
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok || !data.success) {
    throw new Error(
      data.errors?.[0]?.message || "Cloudflare image upload failed"
    );
  }

  // The URL you can use directly
  return data.result.variants[0]; // e.g. https://imagedelivery.net/...
}
