import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

import "./config/aos.ts";
import "./config/i18n.ts";

import { RouterProvider } from "react-router-dom";
import { router } from "./config/router.tsx";
import { WalletProvider } from "./providers/wallet.tsx";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WalletProvider>
      <RouterProvider router={router} />
    </WalletProvider>
  </React.StrictMode>
);
