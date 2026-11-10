"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Chip } from "@heroui/react";
import { LayoutDashboard, LogOut, Menu, X, Boxes } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// later steps add more pages here
const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "manager", "staff"],
  },
];

function SidebarContent({ onNavigate }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-2 py-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/30">
          <Boxes size={22} />
        </div>
        <div>
          <p className="text-lg font-bold leading-none">StockNest</p>
          <p className="text-xs text-white/60">NestMart</p>
        </div>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-1">
        {navItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                  active
                    ? "bg-white/15 font-semibold"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                <item.icon size={18} />
                {item.label}
              </Link>
            );
          })}
      </nav>

      <div className="rounded-xl bg-white/5 p-3">
        <p className="truncate text-sm font-semibold">{user.name}</p>
        <p className="truncate text-xs text-white/60">{user.email}</p>
        <Chip
          size="sm"
          color="primary"
          variant="flat"
          className="mt-2 capitalize"
        >
          {user.role}
        </Chip>
        <Button
          fullWidth
          size="sm"
          variant="flat"
          color="danger"
          className="mt-3"
          startContent={<LogOut size={16} />}
          onPress={logout}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default function AppShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen lg:pl-72">
      {/* desktop sidebar */}
      <aside className="glass fixed bottom-4 left-4 top-4 hidden w-64 p-4 lg:block">
        <SidebarContent />
      </aside>

      {/* mobile top bar */}
      <header className="glass sticky top-3 z-30 mx-3 mt-3 flex items-center justify-between px-4 py-3 lg:hidden">
        <p className="text-lg font-bold">StockNest</p>
        <button onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </button>
      </header>

      {/* mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.aside
              className="glass fixed bottom-3 left-3 top-3 z-50 w-64 p-4"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 260, damping: 30 }}
            >
              <button
                className="absolute right-3 top-3"
                onClick={() => setOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
              <SidebarContent onNavigate={() => setOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="p-4 md:p-8">{children}</main>
    </div>
  );
}
