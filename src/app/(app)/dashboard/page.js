"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Chip, Spinner } from "@heroui/react";
import {
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Wallet,
  Package,
  Boxes,
  AlertTriangle,
  PackageX,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { money } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";

const roleInfo = {
  admin: "Full access: manage users, products, purchases, sales and reports.",
  manager: "Manage products, suppliers, purchase orders, sales and reports.",
  staff: "Create sales and look up products and stock levels.",
};

const tooltipStyle = {
  contentStyle: {
    background: "#161436",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 12,
    color: "#fff",
  },
  labelStyle: { color: "#fff" },
};

const shortDate = (value) => {
  const [, month, day] = value.split("-");
  return `${day}/${month}`;
};

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass glass-hover p-5"
    >
      <div
        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${color}`}
      >
        <Icon size={20} />
      </div>
      <p className="text-xs uppercase tracking-wide text-white/50">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

function StaffDashboard({ user }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="glass glass-hover p-6">
        <p className="mb-3 text-xs uppercase tracking-wide text-white/50">
          Your account
        </p>
        <p className="text-lg font-semibold">{user.name}</p>
        <p className="text-white/70">{user.email}</p>
      </div>
      <div className="glass glass-hover p-6">
        <p className="mb-3 text-xs uppercase tracking-wide text-white/50">
          Role and access
        </p>
        <Chip color="primary" variant="flat" className="capitalize">
          {user.role}
        </Chip>
        <p className="mt-3 text-white/70">{roleInfo[user.role]}</p>
      </div>
    </div>
  );
}

function ManagerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/reports/dashboard")
      .then(({ data: result }) => setData(result))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="mt-16 flex justify-center">
        <Spinner color="primary" />
      </div>
    );
  if (!data)
    return (
      <div className="glass mt-8 p-8 text-center text-white/70">
        Could not load the dashboard data.
      </div>
    );

  const { sales, inventory, daily, topProducts, byCategory, lowStock } = data;

  return (
    <div className="mt-8 space-y-6">
      {/* sales numbers */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Total revenue"
          value={money(sales.revenue)}
          color="bg-indigo-500/30"
          delay={0}
        />
        <StatCard
          icon={ShoppingCart}
          label="Completed sales"
          value={sales.orders}
          color="bg-teal-500/30"
          delay={0.05}
        />
        <StatCard
          icon={TrendingUp}
          label="Average sale"
          value={money(sales.averageOrder)}
          color="bg-pink-500/30"
          delay={0.1}
        />
        <StatCard
          icon={Wallet}
          label="Gross profit"
          value={money(sales.profit)}
          color="bg-emerald-500/30"
          delay={0.15}
        />
      </div>

      {/* inventory numbers */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Package}
          label="Products"
          value={inventory.products}
          color="bg-sky-500/30"
          delay={0.2}
        />
        <StatCard
          icon={Boxes}
          label="Stock value (cost)"
          value={money(inventory.stockValue)}
          color="bg-violet-500/30"
          delay={0.25}
        />
        <StatCard
          icon={AlertTriangle}
          label="Low stock items"
          value={inventory.lowStock}
          color="bg-amber-500/30"
          delay={0.3}
        />
        <StatCard
          icon={PackageX}
          label="Out of stock"
          value={inventory.outOfStock}
          color="bg-red-500/30"
          delay={0.35}
        />
      </div>

      {/* charts */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        <div className="glass p-5 xl:col-span-3">
          <h2 className="mb-4 text-lg font-semibold">Revenue, last 14 days</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  stroke="rgba(255,255,255,0.08)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={shortDate}
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                />
                <YAxis
                  stroke="rgba(255,255,255,0.5)"
                  fontSize={12}
                  width={60}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(value) => [money(value), "Revenue"]}
                  labelFormatter={shortDate}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#818cf8"
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-5 xl:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">Revenue by category</h2>
          {byCategory.length === 0 ? (
            <p className="py-16 text-center text-sm text-white/60">
              No sales yet.
            </p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                <BarChart
                  data={byCategory}
                  layout="vertical"
                  margin={{ left: 10 }}
                >
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.08)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    stroke="rgba(255,255,255,0.5)"
                    fontSize={12}
                    width={90}
                  />
                  <Tooltip
                    {...tooltipStyle}
                    cursor={{ fill: "rgba(255,255,255,0.06)" }}
                    formatter={(value) => [money(value), "Revenue"]}
                  />
                  <Bar dataKey="revenue" fill="#2dd4bf" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* lists */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass p-5">
          <h2 className="mb-4 text-lg font-semibold">Top selling products</h2>
          {topProducts.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/60">
              No sales yet. Create a sale to see your best sellers.
            </p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((item, index) => (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </span>
                  <span className="shrink-0 text-white/70">
                    {item.units} sold · {money(item.revenue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="glass p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Needs restocking</h2>
            <Link
              href="/purchase-orders/new"
              className="text-sm text-indigo-300 hover:underline"
            >
              New purchase order
            </Link>
          </div>
          {lowStock.length === 0 ? (
            <p className="py-6 text-center text-sm text-white/60">
              All products are well stocked.
            </p>
          ) : (
            <ul className="space-y-3">
              {lowStock.map((item) => (
                <li
                  key={item._id}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">{item.name}</span>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={item.stock === 0 ? "danger" : "warning"}
                  >
                    {item.stock === 0 ? "Out of stock" : `${item.stock} left`}
                  </Chip>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const isManager = ["admin", "manager"].includes(user.role);

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
          {isManager
            ? "Here is how your NestMart stores are performing."
            : "Here is an overview of your NestMart workspace."}
        </p>
      </motion.div>

      {isManager ? <ManagerDashboard /> : <StaffDashboard user={user} />}
    </div>
  );
}
