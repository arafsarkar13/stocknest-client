"use client";

import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }) {
  return (
    <HeroUIProvider>
      <AuthProvider>{children}</AuthProvider>
    </HeroUIProvider>
  );
}
