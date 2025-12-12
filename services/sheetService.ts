import { ReportData } from "../types";

// Changed type to 'any' to allow sending formatted data (e.g. joined arrays) that might slightly differ from ReportData strict type
export const saveToGoogleSheet = async (scriptUrl: string, data: any) => {
  try {
    // Google Apps Script requires a specific fetch configuration to handle CORS and redirects correctly
    const response = await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors", // Important for Google Apps Script Web App interaction from client-side
      headers: {
        "Content-Type": "text/plain", // Send as text/plain to avoid preflight OPTION request issues
      },
      body: JSON.stringify(data),
    });

    // Since mode is 'no-cors', we can't read the response content directly to check for success: true.
    // However, if it doesn't throw a network error, it usually means the request reached the server.
    return true;
  } catch (error) {
    console.error("Error saving to Google Sheet:", error);
    throw error;
  }
};