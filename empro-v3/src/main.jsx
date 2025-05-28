import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css";

// redirección si venís desde 404
if (sessionStorage.redirect) {
  const redirectPath = sessionStorage.redirect;
  delete sessionStorage.redirect;
  window.history.replaceState(null, '', redirectPath);
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/EmproChampions-2025">
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);