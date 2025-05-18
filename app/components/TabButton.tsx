"use client";

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function TabButton({
  active,
  onClick,
  children,
}: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`${
        active
          ? "border-indigo-500 text-indigo-600"
          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
      } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
    >
      {children}
    </button>
  );
}
