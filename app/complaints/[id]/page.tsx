"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import ComplaintStatus from "@/app/components/ComplaintStatus";
import {
  ComplaintStatus as ComplaintStatusType,
  Priority,
} from "@prisma/client";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatusType;
  priority: Priority;
  location: string;
  createdAt: string;
  category: {
    name: string;
  };
  agency: {
    name: string;
  };
  responses: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      name: string;
      role: string;
    };
  }>;
}

export default function ComplaintDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (sessionStatus === "authenticated") {
      fetchComplaint();
    } else if (sessionStatus === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [sessionStatus, id]);

  const fetchComplaint = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/complaints/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch complaint details");
      }

      const data = await response.json();
      setComplaint(data);
    } catch (error) {
      console.error("Error fetching complaint:", error);
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
          <button
            onClick={fetchComplaint}
            className="mt-2 text-red-700 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
          Complaint not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-indigo-600 hover:text-indigo-900"
        >
          ← Back
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {complaint.title}
            </h1>
            <p className="mt-2 text-gray-600">{complaint.description}</p>
          </div>
          <div className="flex gap-2">
            <ComplaintStatus status={complaint.status} />
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                complaint.priority === "HIGH" || complaint.priority === "URGENT"
                  ? "bg-red-100 text-red-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {complaint.priority}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
          <div>
            <p className="font-medium">Category</p>
            <p>{complaint.category.name}</p>
          </div>
          <div>
            <p className="font-medium">Agency</p>
            <p>{complaint.agency.name}</p>
          </div>
          <div>
            <p className="font-medium">Location</p>
            <p>{complaint.location}</p>
          </div>
          <div>
            <p className="font-medium">Submitted</p>
            <p>{new Date(complaint.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Responses</h2>
          {complaint.responses.length > 0 ? (
            <div className="space-y-4">
              {complaint.responses.map((response) => (
                <div key={response.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between text-sm text-gray-500 mb-2">
                    <span>
                      {response.user.name} ({response.user.role})
                    </span>
                    <span>
                      {new Date(response.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{response.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No responses yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
