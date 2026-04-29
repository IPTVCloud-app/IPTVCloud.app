export const getApiUrl = () => {
  const url = process.env.PUBLIC_API_URL || "http://localhost:8080";
  return url.replace(/\/$/, "");
};

export const API_URL = getApiUrl();
