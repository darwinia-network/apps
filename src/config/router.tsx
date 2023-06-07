import { createBrowserRouter } from "react-router-dom";

import App from "../App";
import Home from "../pages/Home";
import LocalSubkeyMigration from "../pages/LocalSubkeyMigration";
import { ErrorBoundary } from "../components/ErrorBoundary";

export const router = createBrowserRouter([
  {
    errorElement: <ErrorBoundary />,
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "local_subkey_migration",
        element: <LocalSubkeyMigration />,
      },
    ],
  },
]);
