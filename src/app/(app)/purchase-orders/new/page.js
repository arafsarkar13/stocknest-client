"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PurchaseOrderForm from "@/components/purchase/PurchaseOrderForm";

export default function NewPurchaseOrderPage() {
  return (
    <ProtectedRoute roles={["admin", "manager"]}>
      <div>
        <Link
          href="/purchase-orders"
          className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <ArrowLeft size={16} /> Back to orders
        </Link>
        <h1 className="mb-6 text-3xl font-bold">New purchase order</h1>
        <PurchaseOrderForm />
      </div>
    </ProtectedRoute>
  );
}
