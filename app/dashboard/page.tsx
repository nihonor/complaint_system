"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UserDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    submittedComplaints: 0,
    inProgressComplaints: 0,
    resolvedComplaints: 0,
  });

  const [recentComplaints, setRecentComplaints] = useState([]);
  

  useEffect(() => {
    // Fetch user dashboard data
    const fetchData = async () => {
      try {
        const [statsResponse, complaintsResponse] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/user/recent-complaints"),
        ]);

        const statsData = await statsResponse.json();
        const complaintsData = await complaintsResponse.json();

        setStats(statsData);
        setRecentComplaints(complaintsData);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
  


    fetchData();
  }, []);

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
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {complaint.agency.name}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/complaints/${complaint.id}`)}
                      className="text-indigo-600 hover:text-indigo-900 bg-"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No complaints submitted yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}