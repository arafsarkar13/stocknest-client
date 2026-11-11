"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Input,
  Textarea,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { Plus, Pencil, Trash2, Truck, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { inputStyle, modalStyle } from "@/lib/ui";

const emptyForm = { name: "", email: "", phone: "", address: "" };

function SuppliersContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const modal = useDisclosure();

  const load = async () => {
    try {
      const { data } = await api.get("/suppliers");
      setItems(data);
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

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    modal.onOpen();
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({
      name: item.name,
      email: item.email || "",
      phone: item.phone || "",
      address: item.address || "",
    });
    modal.onOpen();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) await api.put(`/suppliers/${editingId}`, form);
      else await api.post("/suppliers", form);
      toast.success(editingId ? "Supplier updated" : "Supplier added");
      modal.onClose();
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/suppliers/${deleteTarget._id}`);
      toast.success("Supplier deleted");
      setDeleteTarget(null);
      load();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Suppliers</h1>
          <p className="text-white/70">
            The companies you buy your stock from.
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={openCreate}
        >
          Add supplier
        </Button>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass mt-8 p-10 text-center text-white/70">
          No suppliers yet. Add your first supplier.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {items.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 10) * 0.04 }}
              className="glass glass-hover p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/30">
                    <Truck size={20} />
                  </div>
                  <h3 className="text-lg font-semibold leading-tight">
                    {item.name}
                  </h3>
                </div>
                <div className="flex gap-1">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    onPress={() => openEdit(item)}
                    aria-label="Edit"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button
                    isIconOnly
                    size="sm"
                    variant="flat"
                    color="danger"
                    onPress={() => setDeleteTarget(item)}
                    aria-label="Delete"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-white/70">
                <p className="flex items-center gap-2">
                  <Mail size={14} /> {item.email || "No email"}
                </p>
                <p className="flex items-center gap-2">
                  <Phone size={14} /> {item.phone || "No phone"}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={14} /> {item.address || "No address"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
        backdrop="blur"
        classNames={modalStyle}
      >
        <ModalContent>
          <ModalHeader>
            {editingId ? "Edit supplier" : "Add supplier"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Company name"
              variant="bordered"
              value={form.name}
              onValueChange={setField("name")}
              isRequired
              classNames={inputStyle}
            />
            <Input
              label="Email"
              type="email"
              variant="bordered"
              value={form.email}
              onValueChange={setField("email")}
              classNames={inputStyle}
            />
            <Input
              label="Phone"
              variant="bordered"
              value={form.phone}
              onValueChange={setField("phone")}
              classNames={inputStyle}
            />
            <Textarea
              label="Address"
              variant="bordered"
              value={form.address}
              onValueChange={setField("address")}
              classNames={inputStyle}
            />
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={modal.onClose}>
              Cancel
            </Button>
            <Button color="primary" onPress={handleSave} isLoading={saving}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete supplier"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
}

export default function SuppliersPage() {
  return (
    <ProtectedRoute roles={["admin", "manager"]}>
      <SuppliersContent />
    </ProtectedRoute>
  );
}
