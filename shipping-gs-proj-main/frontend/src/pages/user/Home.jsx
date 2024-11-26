import React from "react";
import { useSelector } from "react-redux";
import Dashboard from "./Dashboard";
import AdminDashboard from "../admin/AdminDashboard";

function Home() {
  const role = useSelector((state) => state.auth.user?.role);

  if (role === "admin") {
    return <AdminDashboard />;
  } else {
    return <Dashboard />;
  }
}

export default Home;
