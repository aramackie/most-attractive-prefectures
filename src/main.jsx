import "bulma/css/bulma.css";
import "@creativebulma/bulma-tooltip/dist/bulma-tooltip.min.css";
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.querySelector("#content")).render(<App />);