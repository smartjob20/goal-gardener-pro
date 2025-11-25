import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { SubscriptionProvider } from "./context/SubscriptionContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <AppProvider>
        <SubscriptionProvider>
          <App />
        </SubscriptionProvider>
      </AppProvider>
    </AuthProvider>
  </StrictMode>
);
