"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Textarea, Chip, Spinner } from "@heroui/react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { inputStyle } from "@/lib/ui";

const labels = {
  name: "Name",
  email: "Email",
  phone: "Phone",
  address: "Address",
};

export default function ProfilePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [changing, setChanging] = useState(false);

  const load = async () => {
    try {
      const { data: result } = await api.get("/profile");
      setData(result);
      const { name, email, phone, address } = result.user;
      setForm({ name, email, phone, address });
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setField = (name) => (value) =>
    setForm((current) => ({ ...current, [name]: value }));

  const submitChange = async () => {
    setSaving(true);
    try {
      await api.post("/profile/change-request", form);
      toast.success("Request sent. An admin will review it.");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const withdraw = async () => {
    try {
      await api.delete("/profile/change-request");
      toast.success("Request withdrawn");
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const savePassword = async () => {
    if (passwords.newPassword !== passwords.confirm)
      return toast.error("New passwords do not match");
    setChanging(true);
    try {
      const { data: result } = await api.patch("/profile/password", {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      // the old token stops working, so keep the session alive with the new one
      localStorage.setItem("stocknest_token", result.token);
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      toast.success("Password changed");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setChanging(false);
    }
  };

  if (loading)
    return (
      <div className="mt-24 flex justify-center">
        <Spinner color="primary" />
      </div>
    );
  if (!data)
    return (
      <div className="glass mt-8 p-8 text-center text-white/70">
        Could not load your profile.
      </div>
    );

  const { user, pending, latest } = data;
  const decided =
    latest && latest.status !== "pending" && latest.status !== "cancelled"
      ? latest
      : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold">My profile</h1>
      <p className="mt-1 text-white/70">
        Changes to your details are reviewed by an admin before they take
        effect.
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Chip color="primary" variant="flat" className="capitalize">
          {user.role}
        </Chip>
        <span className="text-sm text-white/60">{user.email}</span>
      </div>

      {/* waiting for approval */}
      {pending && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass mt-6 border-amber-400/40 p-5"
        >
          <p className="flex items-center gap-2 font-semibold text-amber-300">
            <Clock size={18} /> Waiting for admin approval
          </p>
          <p className="mt-1 text-sm text-white/60">
            Sent on {formatDateTime(pending.createdAt)}
          </p>
          <ul className="mt-3 space-y-1 text-sm">
            {Object.entries(pending.changes).map(([field, value]) => (
              <li key={field}>
                <span className="text-white/60">{labels[field]}: </span>
                <span className="text-white/50 line-through">
                  {pending.previous?.[field] || "empty"}
                </span>
                {" → "}
                <span className="font-medium">{value || "empty"}</span>
              </li>
            ))}
          </ul>
          <Button
            size="sm"
            variant="flat"
            color="warning"
            className="mt-4"
            onPress={withdraw}
          >
            Withdraw request
          </Button>
        </motion.div>
      )}

      {/* last decision */}
      {decided && !pending && (
        <div className="glass mt-6 p-4 text-sm">
          <p
            className={`flex items-center gap-2 font-semibold ${decided.status === "approved" ? "text-emerald-400" : "text-red-400"}`}
          >
            {decided.status === "approved" ? (
              <CheckCircle2 size={16} />
            ) : (
              <XCircle size={16} />
            )}
            Your last request was {decided.status}
            {decided.reviewedBy?.name && ` by ${decided.reviewedBy.name}`}
          </p>
          {decided.reviewNote && (
            <p className="mt-1 text-white/70">Note: {decided.reviewNote}</p>
          )}
        </div>
      )}

      {/* edit form */}
      <div className="glass mt-6 space-y-4 p-5">
        <h2 className="text-lg font-semibold">Edit details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Full name"
            variant="bordered"
            value={form.name}
            onValueChange={setField("name")}
            classNames={inputStyle}
            isDisabled={!!pending}
          />
          <Input
            label="Email"
            type="email"
            variant="bordered"
            value={form.email}
            onValueChange={setField("email")}
            classNames={inputStyle}
            isDisabled={!!pending}
          />
          <Input
            label="Phone"
            variant="bordered"
            value={form.phone}
            onValueChange={setField("phone")}
            classNames={inputStyle}
            isDisabled={!!pending}
          />
        </div>
        <Textarea
          label="Address"
          variant="bordered"
          value={form.address}
          onValueChange={setField("address")}
          classNames={inputStyle}
          isDisabled={!!pending}
        />
        <div className="flex justify-end">
          <Button
            color="primary"
            onPress={submitChange}
            isLoading={saving}
            isDisabled={!!pending}
          >
            Submit for approval
          </Button>
        </div>
      </div>

      {/* password */}
      <div className="glass mt-6 space-y-4 p-5">
        <h2 className="text-lg font-semibold">Change password</h2>
        <p className="text-sm text-white/60">
          Applies immediately. You will stay signed in on this device only.
        </p>
        <Input
          label="Current password"
          type="password"
          variant="bordered"
          value={passwords.currentPassword}
          onValueChange={(value) =>
            setPasswords({ ...passwords, currentPassword: value })
          }
          classNames={inputStyle}
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="New password (min 8)"
            type="password"
            variant="bordered"
            value={passwords.newPassword}
            onValueChange={(value) =>
              setPasswords({ ...passwords, newPassword: value })
            }
            classNames={inputStyle}
          />
          <Input
            label="Confirm new password"
            type="password"
            variant="bordered"
            value={passwords.confirm}
            onValueChange={(value) =>
              setPasswords({ ...passwords, confirm: value })
            }
            classNames={inputStyle}
          />
        </div>
        <div className="flex justify-end">
          <Button
            color="primary"
            variant="flat"
            onPress={savePassword}
            isLoading={changing}
          >
            Update password
          </Button>
        </div>
      </div>
    </div>
  );
}
