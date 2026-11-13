"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, FileDown, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { downloadFile } from "@/lib/download";
import { money, formatDateTime } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import ConfirmModal from "@/components/ConfirmModal";
import StatusChip from "@/components/StatusChip";

export default function SaleDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [working, setWorking] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    api
      .get(`/sales/${id}`)
      .then(({ data }) => setSale(data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadFile(`/sales/${id}/invoice`, `${sale.invoiceNumber}.pdf`);
    } catch (error) {
      toast.error(error.message || "Could not download the invoice");
    } finally {
      setDownloading(false);
    }
  };

  const handleCancel = async () => {
    setWorking(true);
    try {
      const { data } = await api.patch(`/sales/${id}/cancel`);
      setSale(data);
      toast.success("Sale cancelled and stock returned");
      setConfirmCancel(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setWorking(false);
    }
  };

  if (loading)
    return (
      <div className="mt-24 flex justify-center">
        <Spinner color="primary" />
      </div>
    );

  if (!sale) {
    return (
      <div className="glass mx-auto mt-16 max-w-md p-8 text-center">
        <p className="text-lg font-semibold">Sale not found</p>
        <Button as={Link} href="/sales" className="mt-4" variant="flat">
          Back to sales
        </Button>
      </div>
    );
  }

  const canCancel =
    ["admin", "manager"].includes(user.role) && sale.status === "completed";

  return (
    <div>
      <Link
        href="/sales"
        className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft size={16} /> Back to sales
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{sale.invoiceNumber}</h1>
          <StatusChip status={sale.status} />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            color="primary"
            startContent={<FileDown size={16} />}
            onPress={handleDownload}
            isLoading={downloading}
          >
            Download PDF
          </Button>
          {canCancel && (
            <Button
              variant="flat"
              color="danger"
              startContent={<XCircle size={16} />}
              onPress={() => setConfirmCancel(true)}
            >
              Cancel sale
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Customer", value: sale.customerName },
          { label: "Payment", value: sale.paymentMethod },
          { label: "Date", value: formatDateTime(sale.createdAt) },
          { label: "Cashier", value: sale.createdBy?.name || "Unknown" },
        ].map((box) => (
          <div key={box.label} className="glass p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              {box.label}
            </p>
            <p className="mt-1 font-semibold capitalize">{box.value}</p>
          </div>
        ))}
      </div>

      <div className="glass mt-6 overflow-x-auto p-4">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead className="text-xs uppercase text-white/50">
            <tr>
              <th className="py-2 pr-3">Product</th>
              <th className="py-2 pr-3">Quantity</th>
              <th className="py-2 pr-3">Price</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sale.items.map((item) => (
              <tr key={item.product} className="border-t border-white/10">
                <td className="py-3 pr-3">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-white/50">{item.sku}</p>
                </td>
                <td className="py-3 pr-3">{item.quantity}</td>
                <td className="py-3 pr-3">{money(item.unitPrice)}</td>
                <td className="py-3 text-right font-semibold">
                  {money(item.lineTotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-3 max-w-xs space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Subtotal</span>
            <span>{money(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Discount</span>
            <span>-{money(sale.discount)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>{money(sale.totalAmount)}</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={handleCancel}
        loading={working}
        title="Cancel sale"
        message="The sale will be marked as cancelled and the products return to your stock."
        confirmLabel="Cancel sale"
      />
    </div>
  );
}
