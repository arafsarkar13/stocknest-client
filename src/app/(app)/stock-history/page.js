"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Chip, Select, SelectItem, Pagination, Spinner } from "@heroui/react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { selectStyle } from "@/lib/ui";
import ProtectedRoute from "@/components/ProtectedRoute";

const types = [
  { key: "in", label: "Stock in" },
  { key: "out", label: "Stock out" },
];

function StockHistoryContent() {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/stock-movements", {
          params: { page, limit: 15, type: type || undefined },
        });
        setMovements(data.movements);
        setPages(data.pages);
      } catch (error) {
        toast.error(getErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, type]);

  return (
    <div>
      <h1 className="text-3xl font-bold">Stock history</h1>
      <p className="text-white/70">
        Every stock-in from purchases and stock-out from sales.
      </p>

      <div className="glass mt-6 p-4 sm:max-w-xs">
        <Select
          placeholder="All movements"
          variant="bordered"
          aria-label="Filter by type"
          selectedKeys={type ? [type] : []}
          onSelectionChange={(keys) => {
            setType(Array.from(keys)[0] || "");
            setPage(1);
          }}
          classNames={selectStyle}
        >
          {types.map((item) => (
            <SelectItem key={item.key}>{item.label}</SelectItem>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : movements.length === 0 ? (
        <div className="glass mt-6 p-10 text-center text-white/70">
          No stock movements yet. Receive a purchase order to see the first
          entry.
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
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Quantity</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">By</th>
              </tr>
            </thead>
            <tbody>
              {movements.map((item) => (
                <tr
                  key={item._id}
                  className="border-t border-white/10 hover:bg-white/5"
                >
                  <td className="px-4 py-3 text-white/70">
                    {formatDateTime(item.createdAt)}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.productName}</td>
                  <td className="px-4 py-3">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={item.type === "in" ? "success" : "danger"}
                    >
                      {item.type === "in" ? "Stock in" : "Stock out"}
                    </Chip>
                  </td>
                  <td
                    className={`px-4 py-3 font-semibold ${item.type === "in" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {item.type === "in" ? "+" : "-"}
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3">{item.reference}</td>
                  <td className="px-4 py-3 text-white/70">
                    {item.createdBy?.name || "-"}
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

export default function StockHistoryPage() {
  return (
    <ProtectedRoute roles={["admin", "manager"]}>
      <StockHistoryContent />
    </ProtectedRoute>
  );
}
