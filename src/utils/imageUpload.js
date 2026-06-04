export const toBase64Payload = (file, fallbackFileName = "thumbnail.jpg") =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      const imageBase64 = result.includes(",") ? result.split(",")[1] : "";

      resolve({
        image_base64: imageBase64,
        mime_type: file.type || "image/jpeg",
        file_name: file.name || fallbackFileName,
        preview: result,
      });
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
