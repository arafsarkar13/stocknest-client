"use client";
import "react-toastify/dist/ReactToastify.css";
import { HeroUIProvider } from "@heroui/react";
import { ToastContainer } from "react-toastify";
import { AuthProvider } from "@/context/AuthContext";

export default function Providers({ children }) {
  return (
    <HeroUIProvider>
      <AuthProvider>
        {children}
        <ToastContainer theme="dark" position="top-right" autoClose={3000} />
      </AuthProvider>
    </HeroUIProvider>
  );
}
