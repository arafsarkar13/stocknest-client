"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Textarea, Select, SelectItem } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { money } from "@/lib/format";
import { inputStyle, selectStyle } from "@/lib/ui";
import ProductSearchBox from "@/components/ProductSearchBox";

// turns a saved order into the form rows
const rowsFromOrder = (order) =>
  order
    ? order.items.map((item) => ({
        product: item.product,
        name: item.name,
        sku: item.sku,
        quantity: String(item.quantity),
        unitCost: String(item.unitCost),
      }))
    : [];

export default function PurchaseOrderForm({ order, onDone, onCancel }) {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [supplier, setSupplier] = useState(order?.supplier?._id || "");
  const [note, setNote] = useState(order?.note || "");
  const [items, setItems] = useState(rowsFromOrder(order)); // the detail rows
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/suppliers")
      .then(({ data }) => setSuppliers(data))
      .catch((error) => toast.error(getErrorMessage(error)));
  }, []);

  const addProduct = (product) => {
    if (items.some((row) => row.product === product._id)) {
      return toast.info("This product is already in the order");
    }
    setItems([
      ...items,
      {
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: "1",
        unitCost: String(product.costPrice || 0),
      },
    ]);
  };

  const changeRow = (index, field, value) => {
    setItems(
      items.map((row, i) => (i === index ? { ...row, [field]: value } : row)),
    );
  };

  const removeRow = (index) => setItems(items.filter((_, i) => i !== index));

  const total = items.reduce(
    (sum, row) =>
      sum + (Number(row.quantity) || 0) * (Number(row.unitCost) || 0),
    0,
  );

  const handleSave = async () => {
    if (!supplier) return toast.error("Please choose a supplier");
    if (items.length === 0) return toast.error("Add at least one product");

    const payload = {
      supplier,
      note,
      items: items.map((row) => ({
        product: row.product,
        quantity: Number(row.quantity),
        unitCost: Number(row.unitCost),
      })),
    };

    setSaving(true);
    try {
      if (order) {
        const { data } = await api.put(
          `/purchase-orders/${order._id}`,
          payload,
        );
        toast.success("Order updated");
        onDone(data);
      } else {
        const { data } = await api.post("/purchase-orders", payload);
        toast.success("Purchase order created");
        router.push(`/purchase-orders/${data._id}`);
      }
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* master: order information */}
      <div className="glass grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
        <Select
          label="Supplier"
          variant="bordered"
          isRequired
          selectedKeys={supplier ? [supplier] : []}
          onSelectionChange={(keys) => setSupplier(Array.from(keys)[0] || "")}
          classNames={selectStyle}
        >
          {suppliers.map((item) => (
            <SelectItem key={item._id}>{item.name}</SelectItem>
          ))}
        </Select>
        <Textarea
          label="Note (optional)"
          variant="bordered"
          value={note}
          onValueChange={setNote}
          minRows={1}
          classNames={inputStyle}
        />
      </div>

      {/* detail: product lines */}
      <div className="glass p-5">
        <h2 className="mb-3 text-lg font-semibold">Order items</h2>
        <ProductSearchBox onPick={addProduct} />

        {items.length === 0 ? (
          <p className="mt-6 text-center text-sm text-white/60">
            No products added yet. Search above to add some.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs uppercase text-white/50">
                <tr>
                  <th className="py-2 pr-3">Product</th>
                  <th className="w-28 py-2 pr-3">Quantity</th>
                  <th className="w-32 py-2 pr-3">Unit cost ($)</th>
                  <th className="w-28 py-2 pr-3 text-right">Line total</th>
                  <th className="w-12 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => (
                  <tr key={row.product} className="border-t border-white/10">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-white/50">{row.sku}</p>
                    </td>
                    <td className="py-3 pr-3">
                      <Input
                        size="sm"
                        type="number"
                        min="1"
                        variant="bordered"
                        aria-label="Quantity"
                        value={row.quantity}
                        onValueChange={(value) =>
                          changeRow(index, "quantity", value)
                        }
                        classNames={inputStyle}
                      />
                    </td>
                    <td className="py-3 pr-3">
                      <Input
                        size="sm"
                        type="number"
                        min="0"
                        step="0.01"
                        variant="bordered"
                        aria-label="Unit cost"
                        value={row.unitCost}
                        onValueChange={(value) =>
                          changeRow(index, "unitCost", value)
                        }
                        classNames={inputStyle}
                      />
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold">
                      {money(
                        (Number(row.quantity) || 0) *
                          (Number(row.unitCost) || 0),
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        color="danger"
                        onPress={() => removeRow(index)}
                        aria-label="Remove"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-white/70">Order total</span>
          <span className="text-2xl font-bold">{money(total)}</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button
          variant="flat"
          onPress={onCancel || (() => router.push("/purchase-orders"))}
        >
          Cancel
        </Button>
        <Button color="primary" onPress={handleSave} isLoading={saving}>
          {order ? "Save changes" : "Create order"}
        </Button>
      </div>
    </div>
  );
}
