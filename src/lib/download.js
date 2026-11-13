import api from "@/lib/api";

// downloads a protected file (the request carries the login token)
export async function downloadFile(url, filename) {
  let response;
  try {
    response = await api.get(url, { responseType: "blob" });
  } catch (error) {
    // an error response also arrives as a blob, so read the message from it
    let message = "Download failed";
    if (error.response?.data instanceof Blob) {
      try {
        message =
          JSON.parse(await error.response.data.text()).message || message;
      } catch (parseError) {
        // keep the default message
      }
    }
    throw new Error(message);
  }

  const blobUrl = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
