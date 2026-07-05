// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import App from "./App";
import theme from "./theme";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {/* CssBaseline resets legacy browser defaults and applies
          theme background/text colors globally */}
      <CssBaseline />
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
