/*
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LogoutButton from "@/app/components/LogoutButton";

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      try {
        // Fetch user verification from the server
        const response = await fetch("/api/admin/verify", {
          method: "POST", // Ensure the method matches your API
          credentials: "include", // Include HttpOnly cookies in the request
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user); // Set user data if verification succeeds
        } else {
          // Redirect to login if verification fails
          router.push("/login");
        }
      } catch (err) {
        console.error("Error verifying user:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null; // Redirect will happen automatically
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p>Welcome, {user.email}</p>
      <LogoutButton />
    </div>
  );
};

export default Dashboard;
*/

"use client";

import React, { useEffect, useState } from "react";

interface User {
  id: string;
  email: string;
  role: string;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch("/api/admin/users", {
        method: "GET",
        credentials: "include", // Ensures cookies are sent with the request
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Response Data:", errorData);
        throw new Error(errorData.message || "Failed to fetch users");
      }
  
      const data = await response.json();
      console.log("Fetched Users:", data);
      setUsers(data.users || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) {
    return <p>Loading users...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <h2>All Users</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
