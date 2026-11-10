"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input, Button } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";

const demoAccounts = [
  { label: "Admin", email: "admin@nestmart.com", password: "Admin@123" },
  { label: "Manager", email: "manager@nestmart.com", password: "Manager@123" },
  { label: "Staff", email: "staff@nestmart.com", password: "Staff@123" },
];

const inputStyle = {
  inputWrapper: "bg-white/5 border-white/25 hover:border-white/50",
};

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // already logged in? go to the dashboard
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="glass w-full max-w-md p-8"
    >
      <h1 className="text-3xl font-bold">Welcome back</h1>
      <p className="mt-1 text-white/70">
        Sign in to manage your NestMart stores.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Email"
          type="email"
          variant="bordered"
          value={email}
          onValueChange={setEmail}
          isRequired
          classNames={inputStyle}
        />
        <Input
          label="Password"
          type="password"
          variant="bordered"
          value={password}
          onValueChange={setPassword}
          isRequired
          classNames={inputStyle}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" color="primary" isLoading={submitting} fullWidth>
          Sign in
        </Button>
      </form>

      <div className="mt-6">
        <p className="mb-2 text-xs uppercase tracking-wide text-white/50">
          Demo accounts (click to fill)
        </p>
        <div className="flex flex-wrap gap-2">
          {demoAccounts.map((account) => (
            <Button
              key={account.label}
              size="sm"
              variant="flat"
              onPress={() => {
                setEmail(account.email);
                setPassword(account.password);
              }}
            >
              {account.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-white/70">
        New here?{" "}
        <Link
          href="/register"
          className="font-semibold text-indigo-300 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </motion.div>
  );
}
