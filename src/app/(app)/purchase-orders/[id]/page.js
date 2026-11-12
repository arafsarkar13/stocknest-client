"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button, Spinner } from "@heroui/react";
import { ArrowLeft, PackageCheck, Pencil, XCircle, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { money, formatDate, formatDateTime } from "@/lib/format";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import StatusChip from "@/components/StatusChip";
import PurchaseOrderForm from "@/components/purchase/PurchaseOrderForm";

const actionText = {
  receive: {
    title: "Receive stock",
    message:
      "This adds the ordered quantities to your inventory and cannot be undone.",
    label: "Receive stock",
    color: "success",
  },
  cancel: {
    title: "Cancel order",
    message: "The order will be closed and no stock will be added.",
    label: "Cancel order",
    color: "danger",
  },
  delete: {
    title: "Delete order",
    message: "This permanently deletes the order.",
    label: "Delete",
    color: "danger",
  },
};

function OrderDetailContent() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [action, setAction] = useState(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    api
      .get(`/purchase-orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch((error) => toast.error(getErrorMessage(error)))
      .finally(() => setLoading(false));
  }, [id]);

  const runAction = async () => {
    setWorking(true);
    try {
      if (action === "receive") {
        const { data } = await api.patch(`/purchase-orders/${id}/receive`);
        setOrder(data);
        toast.success("Stock added to your inventory");
      } else if (action === "cancel") {
        const { data } = await api.patch(`/purchase-orders/${id}/cancel`);
        setOrder(data);
        toast.success("Order cancelled");
      } else if (action === "delete") {
        await api.delete(`/purchase-orders/${id}`);
        toast.success("Order deleted");
        router.push("/purchase-orders");
      }
      setAction(null);
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

  if (!order) {
    return (
      <div className="glass mx-auto mt-16 max-w-md p-8 text-center">
        <p className="text-lg font-semibold">Order not found</p>
        <Button
          as={Link}
          href="/purchase-orders"
          className="mt-4"
          variant="flat"
        >
          Back to orders
        </Button>
      </div>
    );
  }

  const isPending = order.status === "pending";

  return (
    <div>
      <Link
        href="/purchase-orders"
        className="mb-4 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"
      >
        <ArrowLeft size={16} /> Back to orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold">{order.poNumber}</h1>
          <StatusChip status={order.status} />
        </div>

        {!editing && (
          <div className="flex flex-wrap gap-2">
            {isPending && (
              <>
                <Button
                  color="success"
                  startContent={<PackageCheck size={16} />}
                  onPress={() => setAction("receive")}
                >
                  Receive stock
                </Button>
                <Button
                  variant="flat"
                  startContent={<Pencil size={16} />}
                  onPress={() => setEditing(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="flat"
                  color="warning"
                  startContent={<XCircle size={16} />}
                  onPress={() => setAction("cancel")}
                >
                  Cancel
                </Button>
              </>
            )}
            {order.status !== "received" && (
              <Button
                variant="flat"
                color="danger"
                isIconOnly
                aria-label="Delete order"
                onPress={() => setAction("delete")}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        )}
      </div>

      {editing ? (
        <PurchaseOrderForm
          order={order}
          onCancel={() => setEditing(false)}
          onDone={(updated) => {
            setOrder(updated);
            setEditing(false);
          }}
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Supplier", value: order.supplier?.name },
              { label: "Created", value: formatDate(order.createdAt) },
              {
                label: "Created by",
                value: order.createdBy?.name || "Unknown",
              },
              {
                label: order.receivedAt ? "Received" : "Order total",
                value: order.receivedAt
                  ? formatDateTime(order.receivedAt)
                  : money(order.totalAmount),
              },
            ].map((box) => (
              <div key={box.label} className="glass p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  {box.label}
                </p>
                <p className="mt-1 font-semibold">{box.value}</p>
              </div>
            ))}
          </div>

          <div className="glass overflow-x-auto p-4">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-xs uppercase text-white/50">
                <tr>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Quantity</th>
                  <th className="py-2 pr-3">Unit cost</th>
                  <th className="py-2 text-right">Line total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => (
                  <tr key={item.product} className="border-t border-white/10">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-white/50">{item.sku}</p>
                    </td>
                    <td className="py-3 pr-3">{item.quantity}</td>
                    <td className="py-3 pr-3">{money(item.unitCost)}</td>
                    <td className="py-3 text-right font-semibold">
                      {money(item.lineTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-white/70">Total</span>
              <span className="text-2xl font-bold">
                {money(order.totalAmount)}
              </span>
            </div>
          </div>

          {order.note && (
            <div className="glass p-4">
              <p className="text-xs uppercase tracking-wide text-white/50">
                Note
              </p>
              <p className="mt-1 text-white/80">{order.note}</p>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        isOpen={!!action}
        onClose={() => setAction(null)}
        onConfirm={runAction}
        loading={working}
        title={action ? actionText[action].title : ""}
        message={action ? actionText[action].message : ""}
        confirmLabel={action ? actionText[action].label : ""}
        confirmColor={action ? actionText[action].color : "danger"}
      />
    </div>
  );
}

export default function OrderDetailPage() {
  return (
    <ProtectedRoute roles={["admin", "manager"]}>
      <OrderDetailContent />
    </ProtectedRoute>
  );
}
