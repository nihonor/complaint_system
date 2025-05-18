import { useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { ComplaintStatus, Priority } from "@prisma/client";

interface DashboardStats {
  totalComplaints: number;
  complaintsByStatus: Record<ComplaintStatus, number>;
  complaintsByPriority: Record<Priority, number>;
  complaintsByAgency: Array<{
    agencyName: string;
    count: number;
  }>;
  complaintsByCategory: Array<{
    categoryName: string;
    count: number;
  }>;
  averageResponseTime: number;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [timeRange, setTimeRange] = useState("week");

  // Fetch dashboard statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboardStats", timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/stats?timeRange=${timeRange}`);
      if (!response.ok) throw new Error("Failed to fetch dashboard stats");
      return response.json() as Promise<DashboardStats>;
    },
  });

  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">
          You need to be an administrator to view this page.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Time Range Selector Skeleton */}
        <div className="flex justify-end">
          <div className="h-10 w-40 bg-gray-200 rounded-md" />
        </div>

        {/* Overview Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl shadow border border-gray-100"
            >
              <div className="h-5 w-1/2 bg-gray-200 rounded mb-4" />
              <div className="h-10 w-1/3 bg-gray-200 rounded" />
            </div>
          ))}
        </div>

        {/* Status Distribution Skeleton */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <div className="h-5 w-1/3 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-8 w-1/2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Agency Performance Skeleton */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <div className="h-5 w-1/3 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                  <div className="h-2 w-full bg-gray-200 rounded-full" />
                </div>
                <div className="h-4 w-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution Skeleton */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <div className="h-5 w-1/3 bg-gray-200 rounded mb-6" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 w-1/2 bg-gray-200 rounded mb-2" />
                  <div className="h-2 w-full bg-gray-200 rounded-full" />
                </div>
                <div className="h-4 w-8 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution Skeleton */}
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
          <div className="h-5 w-1/3 bg-gray-200 rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-8 w-1/2 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Time Range Selector */}
      <div className="flex justify-end">
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2 bg-white text-gray-700 font-medium hover:border-indigo-400 transition"
        >
          <option value="day">Last 24 Hours</option>
          <option value="week">Last 7 Days</option>
          <option value="month">Last 30 Days</option>
          <option value="year">Last 12 Months</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900">
            Total Complaints
          </h3>
          <p className="mt-2 text-4xl font-extrabold text-indigo-600">
            {stats?.totalComplaints}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900">
            Average Response Time
          </h3>
          <p className="mt-2 text-4xl font-extrabold text-indigo-600">
            {stats?.averageResponseTime.toFixed(1)}h
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900">
            Open Complaints
          </h3>
          <p className="mt-2 text-4xl font-extrabold text-yellow-500">
            {(stats?.complaintsByStatus?.UNDER_REVIEW ?? 0) +
              (stats?.complaintsByStatus?.IN_PROGRESS ?? 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow border border-gray-100 hover:shadow-lg transition">
          <h3 className="text-lg font-semibold text-gray-900">
            Resolved Complaints
          </h3>
          <p className="mt-2 text-4xl font-extrabold text-green-600">
            {stats?.complaintsByStatus.RESOLVED}
          </p>
        </div>
      </div>

      {/* Status Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Complaints by Status
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Object.entries(stats?.complaintsByStatus || {}).map(
            ([status, count]) => (
              <div key={status} className="text-center">
                <p className="text-sm text-gray-500">
                  {status.replace("_", " ")}
                </p>
                <p className="text-2xl font-bold text-indigo-600">{count}</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Agency Performance */}
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Complaints by Agency
        </h3>
        <div className="space-y-4">
          {stats?.complaintsByAgency.map(({ agencyName, count }) => (
            <div key={agencyName} className="flex items-center group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {agencyName}
                </p>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full group-hover:bg-indigo-700 transition-all"
                    style={{
                      width: `${(count / stats.totalComplaints) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <p className="ml-4 text-sm font-medium text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Complaints by Category
        </h3>
        <div className="space-y-4">
          {stats?.complaintsByCategory.map(({ categoryName, count }) => (
            <div key={categoryName} className="flex items-center group">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {categoryName}
                </p>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full group-hover:bg-indigo-700 transition-all"
                    style={{
                      width: `${(count / stats.totalComplaints) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
              <p className="ml-4 text-sm font-medium text-gray-900">{count}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="bg-white p-6 rounded-2xl shadow border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Complaints by Priority
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.complaintsByPriority || {}).map(
            ([priority, count]) => (
              <div key={priority} className="text-center">
                <p className="text-sm text-gray-500">{priority}</p>
                <p className="text-2xl font-bold text-indigo-600">{count}</p>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
