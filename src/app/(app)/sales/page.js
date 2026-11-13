"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { downloadFile } from "@/lib/download";
import { FileSpreadsheet } from "lucide-react";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner,
} from "@heroui/react";
import { Plus, Eye, Search } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { money, formatDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import { inputStyle, selectStyle } from "@/lib/ui";
import StatusChip from "@/components/StatusChip";

const statuses = ["completed", "cancelled"];

export default function SalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [exporting, setExporting] = useState(false);

  const exportExcel = async () => {
    setExporting(true);
    try {
      await downloadFile("/reports/export/sales", "stocknest-sales.xlsx");
    } catch (error) {
      toast.error(error.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/sales", {
          params: {
            page,
            limit: 10,
            search: debouncedSearch || undefined,
            status: status || undefined,
          },
        });
        setSales(data.sales);
        setPages(data.pages);
        setTotal(data.total);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, debouncedSearch, status]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Sales</h1>
          <p className="text-white/70">
            {total} sale{total === 1 ? "" : "s"}
            {user.role === "staff" && " (your own)"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["admin", "manager"].includes(user.role) && (
            <Button
              variant="flat"
              startContent={<FileSpreadsheet size={18} />}
              onPress={exportExcel}
              isLoading={exporting}
            >
              Export Excel
            </Button>
          )}
          <Button
            as={Link}
            href="/sales/new"
            color="primary"
            startContent={<Plus size={18} />}
          >
            New sale
          </Button>
        </div>
      </div>

      <div className="glass mt-6 grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <Input
          placeholder="Search invoice or customer"
          variant="bordered"
          value={search}
          onValueChange={setSearch}
          startContent={<Search size={16} />}
          classNames={inputStyle}
          aria-label="Search sales"
        />
        <Select
          placeholder="All statuses"
          variant="bordered"
          aria-label="Filter by status"
          selectedKeys={status ? [status] : []}
          onSelectionChange={(keys) => {
            setStatus(Array.from(keys)[0] || "");
            setPage(1);
          }}
          classNames={selectStyle}
        >
          {statuses.map((item) => (
            <SelectItem key={item} className="capitalize">
              {item}
            </SelectItem>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : sales.length === 0 ? (
        <div className="glass mt-6 p-10 text-center text-white/70">
          No sales yet. Create your first sale.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mt-6 overflow-x-auto p-2"
        >
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr
                  key={sale._id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-semibold">
                    {sale.invoiceNumber}
                  </td>
                  <td className="px-4 py-3">{sale.customerName}</td>
                  <td className="px-4 py-3">{sale.items.length}</td>
                  <td className="px-4 py-3">{money(sale.totalAmount)}</td>
                  <td className="px-4 py-3 capitalize">{sale.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={sale.status} />
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {formatDate(sale.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      as={Link}
                      href={`/sales/${sale._id}`}
                      size="sm"
                      variant="flat"
                      startContent={<Eye size={14} />}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {pages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            total={pages}
            page={page}
            onChange={setPage}
            showControls
            color="primary"
          />
        </div>
      )}
    </div>
  );
}
