"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Button,
  Card,
  Text,
  Flex,
  Container,
  TextArea,
} from "@radix-ui/themes";

const complaintSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  categoryId: z.string().min(1, "Please select a category"),
  agencyId: z.string().min(1, "Please select an agency"),
  location: z.string().min(3, "Location must be at least 3 characters"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

type Category = {
  id: string;
  name: string;
};

type Agency = {
  id: string;
  name: string;
};

export default function NewComplaintPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      priority: "MEDIUM",
    },
  });

  useEffect(() => {
    // Fetch categories and agencies
    const fetchData = async () => {
      try {
        const [categoriesRes, agenciesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/agencies"),
        ]);

        if (!categoriesRes.ok || !agenciesRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const [categoriesData, agenciesData] = await Promise.all([
          categoriesRes.json(),
          agenciesRes.json(),
        ]);

        console.log("Categories:", categoriesData);
        console.log("Agencies:", agenciesData);

        setCategories(categoriesData);
        setAgencies(agenciesData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load form data. Please try again later.");
      }
    };

    fetchData();
  }, []);

  const onSubmit = async (data: ComplaintFormData) => {
    try {
      setIsLoading(true);
      setError("");

      console.log("Submitting complaint data:", data);

      const response = await fetch("/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Complaint submission response:", result);

      if (!response.ok) {
        throw new Error(result.error || "Failed to submit complaint");
      }

      // Redirect to complaints list after successful submission
      router.push("/dashboard");
    } catch (err) {
      console.error("Complaint submission error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while submitting the complaint"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="2" className="min-h-screen py-8">
      <Card size="3" className="w-full max-w-2xl mx-auto p-6">
        <Flex direction="column" gap="4">
          <Text size="6" weight="bold" align="center">
            Submit a New Complaint
          </Text>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Title
              </Text>
              <input
                {...register("title")}
                type="text"
                placeholder="Brief description of the issue"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.title && (
                <Text size="2" color="red">
                  {errors.title.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Category
              </Text>
              <select
                {...register("categoryId")}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <Text size="2" color="red">
                  {errors.categoryId.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Agency
              </Text>
              <select
                {...register("agencyId")}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Select an agency</option>
                {agencies.map((agency) => (
                  <option key={agency.id} value={agency.id}>
                    {agency.name}
                  </option>
                ))}
              </select>
              {errors.agencyId && (
                <Text size="2" color="red">
                  {errors.agencyId.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Priority
              </Text>
              <select
                {...register("priority")}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
              {errors.priority && (
                <Text size="2" color="red">
                  {errors.priority.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Location
              </Text>
              <input
                {...register("location")}
                type="text"
                placeholder="Where is the issue located?"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.location && (
                <Text size="2" color="red">
                  {errors.location.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <Text as="label" size="2" weight="bold">
                Description
              </Text>
              <textarea
                {...register("description")}
                placeholder="Please provide detailed information about the issue..."
                className="w-full px-3 py-2 border rounded-md min-h-[150px]"
              />
              {errors.description && (
                <Text size="2" color="red">
                  {errors.description.message}
                </Text>
              )}
            </Flex>

            {error && (
              <Text size="2" color="red" align="center">
                {error}
              </Text>
            )}

            <Flex gap="3" justify="end">
              <Button
                type="button"
                variant="soft"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Complaint"}
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Container>
  );
}
