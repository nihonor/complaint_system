"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ComplaintStatus from "../components/ComplaintStatus";
import { ComplaintStatus as ComplaintStatusType } from "@prisma/client";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatusType;
  createdAt: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    submittedComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  });

  const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);

  useEffect(() => {
    // Only fetch data if we have a session
    if (sessionStatus === "authenticated") {
      fetchData();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [sessionStatus]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [statsResponse, complaintsResponse] = await Promise.all([
        fetch("/api/user/stats"),
        fetch("/api/complaints"),
      ]);

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch stats");
      }

      if (!complaintsResponse.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const statsData = await statsResponse.json();
      const complaintsData = await complaintsResponse.json();

      setStats(statsData);
      setRecentComplaints(complaintsData);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (sessionStatus === "loading" || isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg h-32"></div>
            ))}
          </div>
          <div className="bg-gray-200 rounded-lg h-64"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error}</p>
          <button onClick={fetchData} className="mt-2 text-red-700 underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Dashboard</h1>
        <button
          onClick={() => router.push("/complaints/new")}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Submit New Complaint
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Submitted</h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {stats.submittedComplaints}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">In Progress</h3>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {stats.inProgressComplaints}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Resolved</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            {stats.resolvedComplaints}
          </p>
        </div>
      </div>

      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            My Recent Complaints
          </h3>
          <div className="space-y-4">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((complaint) => (
                <div
                  key={complaint.id}
                  className="border-b pb-4 last:border-b-0"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {complaint.title}
                      </h4>
                      <p className="text-sm text-gray-500 mt-1">
                        {complaint.description}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <ComplaintStatus status={complaint.status} />
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/complaints/${complaint.id}`)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No recent complaints</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
