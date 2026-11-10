"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function HomePage() {
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    fetch(`${API_URL}/api/health`)
      .then((res) => res.json())
      .then((data) => setStatus(data.ok ? "connected" : "error"))
      .catch(() => setStatus("error"));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="glass w-full max-w-lg p-8 text-center"
      >
        <h1 className="text-4xl font-bold">StockNest</h1>
        <p className="mt-2 text-white/70">
          Smart inventory and sales for NestMart
        </p>

        <p className="mt-6 text-sm">
          API status:{" "}
          <span
            className={
              status === "connected" ? "text-emerald-400" : "text-amber-300"
            }
          >
            {status === "connected"
              ? "API connected"
              : status === "checking"
                ? "Checking..."
                : "API not reachable"}
          </span>
        </p>

        <Button color="primary" className="mt-6">
          Get Started
        </Button>
      </motion.div>
    </main>
  );
}
