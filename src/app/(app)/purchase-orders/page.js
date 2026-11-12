"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button, Select, SelectItem, Pagination, Spinner } from "@heroui/react";
import { Plus, Eye } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { money, formatDate } from "@/lib/format";
import { selectStyle } from "@/lib/ui";
import ProtectedRoute from "@/components/ProtectedRoute";
import StatusChip from "@/components/StatusChip";

const statuses = ["pending", "received", "cancelled"];

function PurchaseOrdersContent() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/purchase-orders", {
          params: { page, limit: 10, status: status || undefined },
        });
        setOrders(data.orders);
        setPages(data.pages);
        setTotal(data.total);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, status]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Purchase orders</h1>
          <p className="text-white/70">
            {total} order{total === 1 ? "" : "s"}. Receive an order to add its
            stock.
          </p>
        </div>
        <Button
          as={Link}
          href="/purchase-orders/new"
          color="primary"
          startContent={<Plus size={18} />}
        >
          New order
        </Button>
      </div>

      <div className="glass mt-6 p-4 sm:max-w-xs">
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
      ) : orders.length === 0 ? (
        <div className="glass mt-6 p-10 text-center text-white/70">
          No purchase orders yet. Create your first one.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mt-6 overflow-x-auto p-2"
        >
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-white/50">
              <tr>
                <th className="px-4 py-3">PO number</th>
                <th className="px-4 py-3">Supplier</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3 font-semibold">{order.poNumber}</td>
                  <td className="px-4 py-3">{order.supplier?.name}</td>
                  <td className="px-4 py-3">{order.items.length}</td>
                  <td className="px-4 py-3">{money(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <StatusChip status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      as={Link}
                      href={`/purchase-orders/${order._id}`}
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

export default function PurchaseOrdersPage() {
  return (
    <ProtectedRoute roles={["admin", "manager"]}>
      <PurchaseOrdersContent />
    </ProtectedRoute>
  );
}
