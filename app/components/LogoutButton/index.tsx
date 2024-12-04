"use client";

import React from "react";
import { useRouter } from "next/navigation";

const LogoutButton: React.FC = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // Call API to remove token (optional, for server-side logout handling)
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "include", // Include HttpOnly cookies
      });
    } catch (err) {
      console.error("Error during logout:", err);
    }

    // Redirect to login page
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} style={{ margin: "10px", padding: "10px 20px" }}>
      Logout
    </button>
  );
};

export default LogoutButton;