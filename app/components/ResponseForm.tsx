import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSession } from "next-auth/react";
import { ComplaintStatus } from "@prisma/client";

const responseSchema = z.object({
  content: z.string().min(10, "Response must be at least 10 characters"),
  status: z.nativeEnum(ComplaintStatus),
});

type ResponseFormData = z.infer<typeof responseSchema>;

interface ResponseFormProps {
  complaintId: string;
  currentStatus: ComplaintStatus;
  onResponseSubmitted: () => void;
}

export default function ResponseForm({
  complaintId,
  currentStatus,
  onResponseSubmitted,
}: ResponseFormProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResponseFormData>({
    resolver: zodResolver(responseSchema),
    defaultValues: {
      status: currentStatus,
    },
  });

  const onSubmit = async (data: ResponseFormData) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/complaints/${complaintId}/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to submit response");
      }

      onResponseSubmitted();
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session?.user?.role || session.user.role !== "AGENCY_OFFICIAL") {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600">
          Only agency officials can respond to complaints.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 bg-white p-4 rounded-lg shadow"
    >
      <div>
        <label
          htmlFor="content"
          className="block text-sm font-medium text-gray-700"
        >
          Response
        </label>
        <textarea
          id="content"
          rows={4}
          {...register("content")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Enter your response to the complaint..."
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="status"
          className="block text-sm font-medium text-gray-700"
        >
          Update Status
        </label>
        <select
          id="status"
          {...register("status")}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
          <option value="CLOSED">Closed</option>
          <option value="REJECTED">Rejected</option>
        </select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSubmitting ? "Submitting..." : "Submit Response"}
      </button>
    </form>
  );
}
