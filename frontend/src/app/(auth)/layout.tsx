import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 select-none">
      <div className="w-full max-w-md">{children}</div>
    </div>
  );
}
