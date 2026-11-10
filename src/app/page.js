"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@heroui/react";
import {
  Boxes,
  ClipboardList,
  ShoppingCart,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const features = [
  {
    icon: Boxes,
    title: "Live inventory",
    text: "Track every product, SKU and stock level across your stores in real time.",
  },
  {
    icon: ClipboardList,
    title: "Purchase orders",
    text: "Order from suppliers and add stock automatically when goods are received.",
  },
  {
    icon: ShoppingCart,
    title: "Fast sales",
    text: "Create multi-item sales in seconds, with stock deducted instantly.",
  },
  {
    icon: TrendingUp,
    title: "Smart analytics",
    text: "See revenue, best sellers and category performance on one dashboard.",
  },
  {
    icon: ShieldCheck,
    title: "Role-based access",
    text: "Admins, managers and staff each see only what their job needs.",
  },
  {
    icon: FileSpreadsheet,
    title: "Excel and PDF",
    text: "Export reports to Excel and download printable PDF invoices.",
  },
];

export default function HomePage() {
  const { user, loading } = useAuth();

  return (
    <div className="mx-auto max-w-6xl px-4">
      {/* top bar */}
      <header className="glass mt-4 flex items-center justify-between px-5 py-3">
        <div className="flex items-center gap-2">
          <Boxes size={22} />
          <span className="text-lg font-bold">StockNest</span>
        </div>
        {!loading &&
          (user ? (
            <Button as={Link} href="/dashboard" color="primary" size="sm">
              Dashboard
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button as={Link} href="/login" variant="flat" size="sm">
                Login
              </Button>
              <Button as={Link} href="/register" color="primary" size="sm">
                Sign up
              </Button>
            </div>
          ))}
      </header>

      {/* hero */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="py-20 text-center md:py-28"
      >
        <p className="mx-auto mb-4 w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm text-white/80">
          Built for NestMart retail stores
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight md:text-6xl">
          Run every store from one smart dashboard
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-white/70 md:text-lg">
          StockNest keeps your inventory, purchases and sales in sync, so your
          team always knows what is on the shelf and what to reorder.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button
            as={Link}
            href={user ? "/dashboard" : "/register"}
            color="primary"
            size="lg"
          >
            {user ? "Open dashboard" : "Get started"}
          </Button>
          {!user && (
            <Button as={Link} href="/login" variant="bordered" size="lg">
              Login
            </Button>
          )}
        </div>
      </motion.section>

      {/* features */}
      <section className="grid grid-cols-1 gap-6 pb-20 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.08 * index }}
            className="glass glass-hover p-6"
          >
            <feature.icon className="text-indigo-300" size={28} />
            <h3 className="mt-4 text-lg font-semibold">{feature.title}</h3>
            <p className="mt-1 text-sm text-white/70">{feature.text}</p>
          </motion.div>
        ))}
      </section>

      <footer className="pb-8 text-center text-sm text-white/50">
        © 2026 StockNest · Smart inventory and sales for NestMart
      </footer>
    </div>
  );
}
