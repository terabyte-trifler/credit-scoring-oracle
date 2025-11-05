"use client";

import { useEffect } from "react";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  useEffect(() => {
    // Ensure consistent body classes after hydration
    if (typeof window !== "undefined") {
      // Remove any extension-added classes that might cause hydration mismatches
      document.body.className = document.body.className
        .split(" ")
        .filter((cls) => !cls.includes("extension"))
        .join(" ");
    }
  }, []);

  return <>{children}</>;
}
