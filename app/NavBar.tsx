"use client";
import Link from "next/link";
import React from "react";
import { AiFillBug } from "react-icons/ai";
import classnames from "classnames";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "@/app/components";
import {
  Avatar,
  Box,
  Container,
  DropdownMenu,
  Flex,
  Text,
} from "@radix-ui/themes";

const NavBar = () => {
  const links = [
    { label: "Dashboard", href: "/" },
    { label: "Issues", href: "/issues/list" },
  ];
  const currentPath = usePathname();
  const { status, data: session } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push("/auth/login");
  };

  const getDashboardLink = () => {
    if (!session?.user?.role) return "/";

    switch (session.user.role.toLowerCase()) {
      case "admin":
        return "/admin/dashboard";
      case "agency":
        return "/agency/dashboard";
      case "user":
        return "/user/dashboard";
      default:
        return "/";
    }
  };

  return (
    <nav className="mb-3 border py-6 px-6">
      <Container>
        <Flex justify="between">
          <Flex align="center" gap="5">
            <Link href={getDashboardLink()}>
              <AiFillBug size={24} />
            </Link>
            <ul className="flex space-x-6 text-zinc-500 ">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={classnames({
                      "text-zinc-900": link.href === currentPath,
                      "text-zinc-500": link.href !== currentPath,
                      "hover:text-zinc-900 transition-colors": true,
                    })}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Flex>
          <Box>
            {/* {status === "loading" ? (
              <Skeleton />
            ) : session ? (
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <Avatar
                    src={session.user?.image || undefined}
                    fallback={session.user?.name?.[0] || "?"}
                    size="3"
                    radius="full"
                    className="cursor-pointer"
                  />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Label>
                    <Text size="3">{session.user?.email}</Text>
                    <Text size="2" color="gray">
                      {session.user?.role?.toUpperCase()}
                    </Text>
                  </DropdownMenu.Label>
                  <DropdownMenu.Item onClick={handleSignOut}>
                    Log out
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            ) : (
              <Link
                href="/auth/login"
                className="text-zinc-500 hover:text-zinc-900"
              >
                Log in
              </Link>
            )} */}
            {session&& (
              <Link href="/api/auth/signout">Logout</Link>
            )}
            {!session&& (
              <Link href="/api/auth/signin">Login</Link>
            )}
          </Box>
        </Flex>
      </Container>
    </nav>
  );
};

export default NavBar;