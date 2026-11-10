"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  // redirect only AFTER the session check is finished
  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner color="primary" label="Loading..." />
      </div>
    );
  }

  // optional role check, if roles are provided, check if the user's role is included
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="glass max-w-md p-8 text-center">
          <h2 className="text-2xl font-bold">Access denied</h2>
          <p className="mt-2 text-white/70">
            Your role does not have permission to open this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
