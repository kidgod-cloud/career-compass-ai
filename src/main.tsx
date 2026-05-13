import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { initErrorCollector } from "./utils/errorCollector";

initErrorCollector();

createRoot(document.getElementById("root")!).render(<App />);
