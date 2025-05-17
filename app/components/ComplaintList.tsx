import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { ComplaintStatus, Priority, UserRole } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  priority: Priority;
  location?: string;
  createdAt: string;
  category: {
    name: string;
  };
  agency: {
    name: string;
  };
  user: {
    name: string;
    role: UserRole;
  };
  attachments: string[];
  responses: Array<{
    content: string;
    createdAt: string;
    user: {
      name: string;
      role: UserRole;
    };
  }>;
}

export default function ComplaintList() {
  const { data: session } = useSession();
  const [filters, setFilters] = useState({
    status: "",
    categoryId: "",
    agencyId: "",
    priority: "",
    search: "",
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  // Fetch categories and agencies for filters
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error("Failed to fetch categories");
      return response.json();
    },
  });

  const { data: agencies } = useQuery({
    queryKey: ["agencies"],
    queryFn: async () => {
      const response = await fetch("/api/agencies");
      if (!response.ok) throw new Error("Failed to fetch agencies");
      return response.json();
    },
  });

  // Fetch complaints with filters
  const { data: complaints, isLoading } = useQuery({
    queryKey: ["complaints", filters, sortBy, sortOrder],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      queryParams.append("sortBy", sortBy);
      queryParams.append("sortOrder", sortOrder);

      const response = await fetch(`/api/complaints?${queryParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch complaints");
      return response.json();
    },
  });

  const getStatusColor = (status: ComplaintStatus) => {
    const colors = {
      SUBMITTED: "bg-blue-100 text-blue-800",
      UNDER_REVIEW: "bg-yellow-100 text-yellow-800",
      IN_PROGRESS: "bg-purple-100 text-purple-800",
      RESOLVED: "bg-green-100 text-green-800",
      CLOSED: "bg-gray-100 text-gray-800",
      REJECTED: "bg-red-100 text-red-800",
    };
    return colors[status];
  };

  const getPriorityColor = (priority: Priority) => {
    const colors = {
      LOW: "bg-gray-100 text-gray-800",
      MEDIUM: "bg-blue-100 text-blue-800",
      HIGH: "bg-orange-100 text-orange-800",
      URGENT: "bg-red-100 text-red-800",
    };
    return colors[priority];
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg shadow space-y-4">
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search complaints..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            {Object.values(ComplaintStatus).map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters({ ...filters, priority: e.target.value })
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            {Object.values(Priority).map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
          <select
            value={filters.categoryId}
            onChange={(e) =>
              setFilters({ ...filters, categoryId: e.target.value })
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {categories?.map((category: any) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <select
            value={filters.agencyId}
            onChange={(e) =>
              setFilters({ ...filters, agencyId: e.target.value })
            }
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="">All Agencies</option>
            {agencies?.map((agency: any) => (
              <option key={agency.id} value={agency.id}>
                {agency.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="createdAt">Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
          <span className="text-sm text-gray-500">
            {complaints?.length || 0} complaints found
          </span>
        </div>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints?.map((complaint: Complaint) => (
          <div
            key={complaint.id}
            className="bg-white shadow rounded-lg p-6 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {complaint.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {complaint.description}
                </p>
              </div>
              <div className="flex gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                    complaint.status
                  )}`}
                >
                  {complaint.status.replace("_", " ")}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                    complaint.priority
                  )}`}
                >
                  {complaint.priority}
                </span>
              </div>
            </div>

            <div className="flex gap-4 text-sm text-gray-500">
              <span>Category: {complaint.category.name}</span>
              <span>Agency: {complaint.agency.name}</span>
              {complaint.location && (
                <span>Location: {complaint.location}</span>
              )}
              <span>
                Submitted by: {complaint.user.name} (
                {complaint.user.role.toLowerCase()})
              </span>
              <span>
                Date: {new Date(complaint.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Attachments */}
            {complaint.attachments?.length > 0 && (
              <div className="mt-2">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Attachments
                </h4>
                <div className="flex gap-2">
                  {complaint.attachments.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                    >
                      Attachment {index + 1}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Responses */}
            {complaint.responses.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-medium text-gray-900">Responses</h4>
                {complaint.responses.map((response, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 rounded-md p-3 text-sm"
                  >
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>
                        {response.user.name} ({response.user.role.toLowerCase()}
                        )
                      </span>
                      <span>
                        {new Date(response.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{response.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Response Button for Agency Officials */}
            {session?.user?.role === "AGENCY_OFFICIAL" && (
              <button
                onClick={() => {
                  // Implement response form
                }}
                className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Response
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
