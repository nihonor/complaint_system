"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Agencies, { fetchAgencies } from "./Agencies";
import Categories, { fetchCategories } from "./Categories";
import { MdSpeed } from "react-icons/md";
import axios from "axios";
import {
  AlertDialog,
  Button,
  Callout,
  DropdownMenu,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes";
import { Table } from "@radix-ui/themes";
import Card from "./Card";

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [showAddAgency, setShowAddAgency] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newAgency, setNewAgency] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"agencies" | "categories">(
    "agencies"
  );

  useEffect(() => {
    console.log("Session in admin dashboard:", session);
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      console.log("User role:", session?.user?.role);
      router.push("/auth/login");
    } else {
      fetchAgencies();
      fetchCategories();
    }
  }, [session, status, router]);

  const handleAddAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/agencies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAgency),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add agency");
      }

      setSuccess("Agency added successfully");
      setNewAgency({ name: "", email: "", password: "" });
      setShowAddAgency(false);
      fetchAgencies();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCategory),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to add category");
      }

      setSuccess("Category added successfully");
      setNewCategory({ name: "", description: "" });
      setShowAddCategory(false);
      fetchCategories();
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleToggleAgencyStatus = async (agencyId: string) => {
    try {
      const response = await fetch(`/api/admin/agencies/${agencyId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "inactive",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update agency status");
      }

      fetchAgencies();
    } catch (error) {
      console.error("Error updating agency status:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role.toLowerCase() !== "admin") {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="space-x-2">
          <Button onClick={() => setShowAddAgency(true)}>Add New Agency</Button>
          <Button onClick={() => setShowAddCategory(true)}>
            Add New Category
          </Button>
        </div>
      </div>
     


      {error && (
        <Callout.Root color="red" className="mb-4">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}

      {success && (
        <Callout.Root color="green" className="mb-4">
          <Callout.Text>{success}</Callout.Text>
        </Callout.Root>
      )}

      {/* Add Agency Modal */}
      {showAddAgency && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Agency</h2>
            <form onSubmit={handleAddAgency} className="space-y-4">
             
                  <input
                    type="text"
                    placeholder="Agency Name"
                    value={newAgency.name}
                    onChange={(e) =>
                      setNewAgency({ ...newAgency, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
               
              
                  <input
                    type="email"
                    placeholder="Agency Email"
                    value={newAgency.email}
                    onChange={(e) =>
                      setNewAgency({ ...newAgency, email: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
               
              
                  <input
                    type="password"
                    placeholder="Password"
                    value={newAgency.password}
                    onChange={(e) =>
                      setNewAgency({ ...newAgency, password: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
               
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowAddAgency(false)}>Cancel</Button>
                <Button type="submit">Add Agency</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add New Category</h2>
            <form onSubmit={handleAddCategory} className="space-y-4">
             
                  <input
                    type="text"
                    placeholder="Category Name"
                    value={newCategory.name}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, name: e.target.value })
                    }
                    className="w-full p-2 border rounded"
                    required
                  />
              
              
                  <textarea
                    placeholder="Category Description"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory({
                        ...newCategory,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-2 border rounded"
                    rows={3}
                  />
                
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setShowAddCategory(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Category</Button>
              </div>
            </form>
          </div>
        </div>
      )}
<div className="flex gap-4">
  
      {/* Tabs */}
      <Flex direction="row" gap="4">
        <Agencies />
        <Categories />
      </Flex>
</div>

      {/* Content */}
    </div>
  );
}
