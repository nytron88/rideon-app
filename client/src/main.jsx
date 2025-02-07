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
import { Home, UserSignup } from "./pages";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<App />}>
      <Route path="" element={<Home />} />
      <Route
        path="user-signup"
        element={
          <AuthLayout authentication={false}>
            <UserSignup />
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
