"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button, Card, Text, Flex, Container } from "@radix-ui/themes";

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      setError("");

      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      // Redirect to login page after successful registration
      router.push("/auth/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred during registration"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container
      size="2"
      className="min-h-screen flex items-center justify-center"
    >
      <Card size="3" className="w-full max-w-md p-6">
        <Flex direction="column" gap="4">
          <Text size="6" weight="bold" align="center">
            Create a new account
          </Text>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Flex direction="column" gap="2">
              <input
                {...register("name")}
                type="text"
                placeholder="Full name"
                autoComplete="name"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.name && (
                <Text size="2" color="red">
                  {errors.name.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <input
                {...register("email")}
                type="email"
                placeholder="Email address"
                autoComplete="email"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.email && (
                <Text size="2" color="red">
                  {errors.email.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <input
                {...register("password")}
                type="password"
                placeholder="Password"
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.password && (
                <Text size="2" color="red">
                  {errors.password.message}
                </Text>
              )}
            </Flex>

            <Flex direction="column" gap="2">
              <input
                {...register("confirmPassword")}
                type="password"
                placeholder="Confirm password"
                autoComplete="new-password"
                className="w-full px-3 py-2 border rounded-md"
              />
              {errors.confirmPassword && (
                <Text size="2" color="red">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </Flex>

            {error && (
              <Text size="2" color="red" align="center">
                {error}
              </Text>
            )}

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Creating account..." : "Create account"}
            </Button>

            <Flex justify="center" gap="2">
              <Text size="2">Already have an account?</Text>
              <Button
                variant="ghost"
                onClick={() => router.push("/auth/login")}
              >
                Sign in
              </Button>
            </Flex>
          </form>
        </Flex>
      </Card>
    </Container>
  );
}
