import React from "react";
import App from "./App";
import { createRoot } from "react-dom/client";
import "./index.css";
import { store } from "./store/store.js";
import { Provider } from "react-redux";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import { AuthLayout } from "./components";
import { Home, GetStarted, CaptainVehicle } from "./pages";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Home />} />
      <Route
        path="get-started"
        element={
          <AuthLayout authentication={false}>
            <GetStarted />
          </AuthLayout>
        }
      />
      <Route
        path="captain/vehicle"
        element={
          <AuthLayout authentication={true} allowedRole="captain">
            <CaptainVehicle />
          </AuthLayout>
        }
      />
    </Route>
  )
);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  </Provider>
);
