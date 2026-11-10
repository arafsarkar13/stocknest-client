"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input, Button } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import { getErrorMessage } from "@/lib/api";

const inputStyle = {
  inputWrapper: "bg-white/5 border-white/25 hover:border-white/50",
};

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [loading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password.length < 6)
      return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setSubmitting(true);
    try {
      await register(name, email, password);
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
      <h1 className="text-3xl font-bold">Create your account</h1>
      <p className="mt-1 text-white/70">Join the NestMart team on StockNest.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
        <Input
          label="Full name"
          variant="bordered"
          value={name}
          onValueChange={setName}
          isRequired
          classNames={inputStyle}
        />
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
        <Input
          label="Confirm password"
          type="password"
          variant="bordered"
          value={confirm}
          onValueChange={setConfirm}
          isRequired
          classNames={inputStyle}
        />

        {error && <p className="text-sm text-red-400">{error}</p>}

        <Button type="submit" color="primary" isLoading={submitting} fullWidth>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-white/70">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-300 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
