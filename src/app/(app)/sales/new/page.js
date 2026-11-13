"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SaleForm from "@/components/sales/SaleForm";

export default function NewSalePage() {
  return (
    <div>
      <Link
        href="/sales"
        className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft size={16} /> Back to sales
      </Link>
      <h1 className="mb-6 text-3xl font-bold">New sale</h1>
      <SaleForm />
    </div>
  );
}
