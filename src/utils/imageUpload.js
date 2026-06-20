export const toBase64Payload = (
  file,
  fallbackFileName = "thumbnail.jpg",
  {
    base64Key = "image_base64",
    mimeTypeKey = "mime_type",
    fileNameKey = "file_name",
  } = {},
) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const fileBase64 = result.includes(",") ? result.split(",")[1] : "";

      resolve({
        [base64Key]: fileBase64,
        [mimeTypeKey]: file.type || "image/jpeg",
        [fileNameKey]: file.name || fallbackFileName,
        preview: result,
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
