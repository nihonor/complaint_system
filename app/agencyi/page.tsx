"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AgencyDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    pendingComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  });

  const [recentComplaints, setRecentComplaints] = useState([]);

  useEffect(() => {
    // Fetch agency dashboard data
    const fetchData = async () => {
      try {
        const [statsResponse, complaintsResponse] = await Promise.all([
          fetch("/api/agency/stats"),
          fetch("/api/agency/recent-complaints"),
        ]);

        const statsData = await statsResponse.json();
        const complaintsData = await complaintsResponse.json();

        setStats(statsData);
        setRecentComplaints(complaintsData);
      } catch (error) {
        console.error("Error fetching agency data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agency Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Pending Complaints
          </h3>
          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {stats.pendingComplaints}
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
            Recent Complaints
          </h3>
          <div className="space-y-4">
            {recentComplaints.length > 0 ? (
              recentComplaints.map((complaint: any) => (
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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        router.push(`/agency/complaints/${complaint.id}`)
                      }
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
