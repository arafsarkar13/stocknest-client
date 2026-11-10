"use client";

import { motion } from "framer-motion";
import { Chip } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";

const roleInfo = {
  admin: "Full access: manage users, products, purchases, sales and reports.",
  manager: "Manage products, suppliers, purchase orders, sales and reports.",
  staff: "Create sales and look up products and stock levels.",
};

export default function DashboardPage() {
  const { user } = useAuth();

  const cards = [
    {
      title: "Your account",
      body: (
        <>
          <p className="text-lg font-semibold">{user.name}</p>
          <p className="text-white/70">{user.email}</p>
        </>
      ),
    },
    {
      title: "Role and access",
      body: (
        <>
          <Chip color="primary" variant="flat" className="capitalize">
            {user.role}
          </Chip>
          <p className="mt-3 text-white/70">{roleInfo[user.role]}</p>
        </>
      ),
    },
  ];

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold">
          Welcome back, {user.name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-white/70">
          Here is an overview of your NestMart workspace.
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        {cards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
            className="glass glass-hover p-6"
          >
            <p className="mb-3 text-xs uppercase tracking-wide text-white/50">
              {card.title}
            </p>
            {card.body}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
