import React from "react";

export default function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect to login
  };

  return (
    <div>
      <h1>Welcome, {user?.email || "User"} 🎉</h1>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
