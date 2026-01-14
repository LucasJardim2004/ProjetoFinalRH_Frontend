/**
 * Downloads a PDF file from fileBytes (base64 string)
 * @param {string} fileName - The name of the file to download
 * @param {string} fileBytes - The file as a base64 string (from JSON serialization of byte[])
 */
export function downloadPdfFile(fileName, fileBytes) {
  // fileBytes comes as a base64 string from JSON
  // Decode base64 string to binary
  const binaryString = atob(fileBytes);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Create blob from binary data
  const blob = new Blob([bytes], { type: "application/pdf" });

  // Create a temporary URL for the blob
  const url = window.URL.createObjectURL(blob);

  // Create a temporary anchor element and trigger download
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName || "document.pdf";
  document.body.appendChild(link);
  link.click();

  // Clean up
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
