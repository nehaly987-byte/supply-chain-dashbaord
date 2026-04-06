import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from '@workspace/api-client-react'

// Set the base URL for the API client to the VITE_API_URL env var, or fallback to relative /api
// In production on Vercel, you'll set VITE_API_URL to your Render backend URL (e.g. https://supply-chain-api.onrender.com)
const apiUrl = import.meta.env.VITE_API_URL || "https://supply-chain-dashbaord.onrender.com";
setBaseUrl(apiUrl);
console.log("API URL:", import.meta.env.VITE_API_URL);

createRoot(document.getElementById("root")!).render(<App />);
