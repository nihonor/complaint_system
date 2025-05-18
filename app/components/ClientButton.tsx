"use client";

import { Button } from "@radix-ui/themes";

interface ClientButtonProps {
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  children: React.ReactNode;
  color?:
    | "red"
    | "gray"
    | "blue"
    | "green"
    | "yellow"
    | "purple"
    | "orange"
    | "pink"
    | "indigo"
    | "teal"
    | "cyan"
    | "lime"
    | "amber"
    | "violet"
    | "sky"
    | "mint"
    | "tomato"
    | "crimson"
    | "plum"
    | "grass"
    | "brown"
    | "gold"
    | "bronze";
  variant?: "solid" | "soft" | "outline" | "ghost";
  disabled?: boolean;
}

export default function ClientButton({
  onClick,
  type,
  children,
  color,
  variant,
  disabled,
}: ClientButtonProps) {
  return (
    <Button
      onClick={onClick}
      type={type}
      color={color}
      variant={variant}
      disabled={disabled}
    >
      {children}
    </Button>
  );
}
