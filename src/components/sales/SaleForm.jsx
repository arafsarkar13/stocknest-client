"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, SelectItem } from "@heroui/react";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { money } from "@/lib/format";
import { inputStyle, selectStyle } from "@/lib/ui";
import ProductSearchBox from "@/components/ProductSearchBox";

const payments = ["cash", "card", "mobile"];

export default function SaleForm() {
  const router = useRouter();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [discount, setDiscount] = useState("");
  const [items, setItems] = useState([]); // the detail rows
  const [saving, setSaving] = useState(false);

  const addProduct = (product) => {
    if (product.stock <= 0)
      return toast.error(`"${product.name}" is out of stock`);
    if (items.some((row) => row.product === product._id)) {
      return toast.info("This product is already in the sale");
    }
    setItems([
      ...items,
      {
        product: product._id,
        name: product.name,
        sku: product.sku,
        price: product.price,
        stock: product.stock,
        quantity: "1",
      },
    ]);
  };

  const changeQuantity = (index, value) => {
    setItems(
      items.map((row, i) => (i === index ? { ...row, quantity: value } : row)),
    );
  };

  const removeRow = (index) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce(
    (sum, row) => sum + (Number(row.quantity) || 0) * row.price,
    0,
  );
  const discountValue = Number(discount) || 0;
  const total = Math.max(subtotal - discountValue, 0);

  const handleSave = async () => {
    if (items.length === 0) return toast.error("Add at least one product");

    for (const row of items) {
      const quantity = Number(row.quantity);
      if (!Number.isInteger(quantity) || quantity < 1)
        return toast.error(`Check the quantity for "${row.name}"`);
      if (quantity > row.stock)
        return toast.error(`Only ${row.stock} of "${row.name}" in stock`);
    }
    if (discountValue < 0 || discountValue > subtotal)
      return toast.error("Discount must be between 0 and the subtotal");

    setSaving(true);
    try {
      const { data } = await api.post("/sales", {
        customerName,
        customerPhone,
        paymentMethod,
        discount: discountValue,
        items: items.map((row) => ({
          product: row.product,
          quantity: Number(row.quantity),
        })),
      });
      toast.success(`Sale ${data.invoiceNumber} completed`);
      router.push(`/sales/${data._id}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* detail: cart */}
      <div className="glass p-5 lg:col-span-2">
        <h2 className="mb-3 text-lg font-semibold">Items</h2>
        <ProductSearchBox onPick={addProduct} />

        {items.length === 0 ? (
          <p className="mt-6 text-center text-sm text-white/60">
            The cart is empty. Search a product above to add it.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="text-xs uppercase text-white/50">
                <tr>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Price</th>
                  <th className="w-28 py-2 pr-3">Qty</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                  <th className="w-12 py-2" />
                </tr>
              </thead>
              <tbody>
                {items.map((row, index) => (
                  <tr key={row.product} className="border-t border-white/10">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{row.name}</p>
                      <p className="text-xs text-white/50">
                        {row.stock} in stock
                      </p>
                    </td>
                    <td className="py-3 pr-3">{money(row.price)}</td>
                    <td className="py-3 pr-3">
                      <Input
                        size="sm"
                        type="number"
                        min="1"
                        max={row.stock}
                        variant="bordered"
                        aria-label="Quantity"
                        value={row.quantity}
                        onValueChange={(value) => changeQuantity(index, value)}
                        classNames={inputStyle}
                      />
                    </td>
                    <td className="py-3 pr-3 text-right font-semibold">
                      {money((Number(row.quantity) || 0) * row.price)}
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
      </div>

      {/* master: customer and totals */}
      <div className="glass h-fit space-y-4 p-5">
        <h2 className="text-lg font-semibold">Sale details</h2>
        <Input
          label="Customer name"
          variant="bordered"
          value={customerName}
          onValueChange={setCustomerName}
          placeholder="Walk-in Customer"
          classNames={inputStyle}
        />
        <Input
          label="Phone (optional)"
          variant="bordered"
          value={customerPhone}
          onValueChange={setCustomerPhone}
          classNames={inputStyle}
        />
        <Select
          label="Payment method"
          variant="bordered"
          selectedKeys={[paymentMethod]}
          onSelectionChange={(keys) =>
            setPaymentMethod(Array.from(keys)[0] || "cash")
          }
          classNames={selectStyle}
        >
          {payments.map((item) => (
            <SelectItem key={item} className="capitalize">
              {item}
            </SelectItem>
          ))}
        </Select>
        <Input
          label="Discount ($)"
          type="number"
          min="0"
          variant="bordered"
          value={discount}
          onValueChange={setDiscount}
          classNames={inputStyle}
        />

        <div className="space-y-2 border-t border-white/10 pt-4 text-sm">
          <div className="flex justify-between text-white/70">
            <span>Subtotal</span>
            <span>{money(subtotal)}</span>
          </div>
          <div className="flex justify-between text-white/70">
            <span>Discount</span>
            <span>-{money(discountValue)}</span>
          </div>
          <div className="flex justify-between text-xl font-bold">
            <span>Total</span>
            <span>{money(total)}</span>
          </div>
        </div>

        <Button
          color="primary"
          fullWidth
          onPress={handleSave}
          isLoading={saving}
        >
          Complete sale
        </Button>
        <Button variant="flat" fullWidth onPress={() => router.push("/sales")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
