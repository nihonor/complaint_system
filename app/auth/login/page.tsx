"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Callout, Text, TextField } from "@radix-ui/themes";
import { useSession } from "next-auth/react";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const getDashboardLink = () => {
    if (!session?.user?.role) {
      console.log("No role found in session:", session);
      return "/auth/login";
    }

    const role = session.user.role.toLowerCase();
    console.log("User role:", role);

    switch (role) {
      case "admin":
        return "/admini";
      case "agency_official":
        return "/agencyi";
      case "user":
        return "/dashboard";
      default:
        console.log("Unknown role:", role);
        return "/auth/login";
    }
  };

  useEffect(() => {
    if (status === "authenticated" && session) {
      console.log("Session authenticated:", session);
      const dashboardLink = getDashboardLink();
      console.log("Redirecting to:", dashboardLink);
      router.push(dashboardLink);
    }
  }, [session, status, router]);

  const onSubmit = async (data: LoginForm) => {
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid credentials");
        return;
      }

      // After successful login, refresh the page to get the new session
      router.refresh();
    } catch (error) {
      setError("An unexpected error occurred.");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    return null;
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      {error && (
        <Callout.Root color="red" className="mb-5">
          <Callout.Icon>icon</Callout.Icon>
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <TextField.Root>
          <TextField.Slot>
            <input
              type="email"
              placeholder="Email"
              {...register("email")}
              className="w-full p-2 border rounded"
            />
          </TextField.Slot>
        </TextField.Root>
        {errors.email && (
          <Text color="red" as="p">
            {errors.email.message}
          </Text>
        )}
        <TextField.Root>
          <TextField.Slot>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full p-2 border rounded"
            />
          </TextField.Slot>
        </TextField.Root>
        {errors.password && (
          <Text color="red" as="p">
            {errors.password.message}
          </Text>
        )}
        <Button disabled={isSubmitting}>
          {isSubmitting ? "Logging in..." : "Log in"}
        </Button>
      </form>
    </div>
  );
};

export default LoginPage;
