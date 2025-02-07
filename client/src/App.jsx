import React from "react";
import { Outlet } from "react-router-dom";
import { Footer, Header } from "./components";

function App() {
  return (
    <div>
      <Header />
      <Outlet />
      <Footer />
    </div>
  );
}

export default App;
