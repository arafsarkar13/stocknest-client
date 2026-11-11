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
import { Plus, Pencil, Trash2, Tags } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import ProtectedRoute from "@/components/ProtectedRoute";
import ConfirmModal from "@/components/ConfirmModal";
import { inputStyle, modalStyle } from "@/lib/ui";

const emptyForm = { name: "", description: "" };

function CategoriesContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const modal = useDisclosure();

  const load = async () => {
    try {
      const { data } = await api.get("/categories");
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

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    modal.onOpen();
  };

  const openEdit = (item) => {
    setEditingId(item._id);
    setForm({ name: item.name, description: item.description || "" });
    modal.onOpen();
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) await api.put(`/categories/${editingId}`, form);
      else await api.post("/categories", form);
      toast.success(editingId ? "Category updated" : "Category added");
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
      await api.delete(`/categories/${deleteTarget._id}`);
      toast.success("Category deleted");
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
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-white/70">
            Group your products so they are easy to find.
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Plus size={18} />}
          onPress={openCreate}
        >
          Add category
        </Button>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass mt-8 p-10 text-center text-white/70">
          No categories yet. Add one, or import products to create them
          automatically.
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
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
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/30">
                    <Tags size={20} />
                  </div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
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
              <p className="mt-3 text-sm text-white/70">
                {item.description || "No description"}
              </p>
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
            {editingId ? "Edit category" : "Add category"}
          </ModalHeader>
          <ModalBody className="gap-4">
            <Input
              label="Name"
              variant="bordered"
              value={form.name}
              onValueChange={(value) => setForm({ ...form, name: value })}
              isRequired
              classNames={inputStyle}
            />
            <Textarea
              label="Description"
              variant="bordered"
              value={form.description}
              onValueChange={(value) =>
                setForm({ ...form, description: value })
              }
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
        title="Delete category"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
}

export default function CategoriesPage() {
  return (
    <ProtectedRoute roles={["admin", "manager"]}>
      <CategoriesContent />
    </ProtectedRoute>
  );
}
