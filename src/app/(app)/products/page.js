"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Chip,
  Pagination,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { Plus, Pencil, Trash2, Search, ImageIcon, Upload } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { money } from "@/lib/format";
import ConfirmModal from "@/components/ConfirmModal";
import { inputStyle, selectStyle, modalStyle } from "@/lib/ui";

const emptyForm = {
  name: "",
  sku: "",
  brand: "",
  description: "",
  category: "",
  supplier: "",
  price: "",
  costPrice: "",
  stock: "",
  lowStockLimit: "10",
  image: "",
};

function StockChip({ product }) {
  if (product.stock === 0)
    return (
      <Chip size="sm" color="danger" variant="flat">
        Out of stock
      </Chip>
    );
  if (product.stock <= product.lowStockLimit)
    return (
      <Chip size="sm" color="warning" variant="flat">
        Low: {product.stock}
      </Chip>
    );
  return (
    <Chip size="sm" color="success" variant="flat">
      {product.stock} in stock
    </Chip>
  );
}

export default function ProductsPage() {
  const { user } = useAuth();
  const canEdit = ["admin", "manager"].includes(user.role);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [lowOnly, setLowOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const modal = useDisclosure();

  // wait a moment after typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // categories and suppliers are needed for the filter and the form
  useEffect(() => {
    const loadLists = async () => {
      try {
        const requests = [api.get("/categories")];
        if (canEdit) requests.push(api.get("/suppliers"));
        const [categoryResponse, supplierResponse] =
          await Promise.all(requests);
        setCategories(categoryResponse.data);
        if (supplierResponse) setSuppliers(supplierResponse.data);
      } catch (error) {
        toast.error(getErrorMessage(error));
      }
    };
    loadLists();
  }, [canEdit]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/products", {
        params: {
          page,
          limit: 12,
          search: debouncedSearch || undefined,
          category: categoryFilter || undefined,
          lowStock: lowOnly || undefined,
        },
      });
      setProducts(data.products);
      setPages(data.pages);
      setTotal(data.total);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [page, debouncedSearch, categoryFilter, lowOnly]);

  const setField = (name) => (value) =>
    setForm((current) => ({ ...current, [name]: value }));

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    modal.onOpen();
  };

  const openEdit = (product) => {
    setEditingId(product._id);
    setForm({
      name: product.name,
      sku: product.sku,
      brand: product.brand || "",
      description: product.description || "",
      category: product.category?._id || "",
      supplier: product.supplier?._id || "",
      price: String(product.price),
      costPrice: String(product.costPrice ?? 0),
      stock: String(product.stock),
      lowStockLimit: String(product.lowStockLimit),
      image: product.image || "",
    });
    modal.onOpen();
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2MB or smaller");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("image", file);
    setUploading(true);
    try {
      const { data } = await api.post("/uploads/image", formData);
      setForm((current) => ({ ...current, image: data.url }));
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.category || form.price === "") {
      return toast.error("Name, category and price are required");
    }

    const payload = {
      ...form,
      price: Number(form.price),
      costPrice: Number(form.costPrice || 0),
      stock: Number(form.stock || 0),
      lowStockLimit: Number(form.lowStockLimit || 10),
    };

    setSaving(true);
    try {
      if (editingId) await api.put(`/products/${editingId}`, payload);
      else await api.post("/products", payload);
      toast.success(editingId ? "Product updated" : "Product added");
      modal.onClose();
      loadProducts();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setSaving(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success("Product deleted");
      setDeleteTarget(null);
      loadProducts();
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
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-white/70">
            {total} product{total === 1 ? "" : "s"} in your catalog
          </p>
        </div>
        {canEdit && (
          <Button
            color="primary"
            startContent={<Plus size={18} />}
            onPress={openCreate}
          >
            Add product
          </Button>
        )}
      </div>

      {/* filters */}
      <div className="glass mt-6 grid grid-cols-1 items-center gap-4 p-4 md:grid-cols-3">
        <Input
          placeholder="Search name, SKU or brand"
          variant="bordered"
          value={search}
          onValueChange={setSearch}
          startContent={<Search size={16} />}
          classNames={inputStyle}
          aria-label="Search products"
        />
        <Select
          placeholder="All categories"
          variant="bordered"
          aria-label="Filter by category"
          selectedKeys={categoryFilter ? [categoryFilter] : []}
          onSelectionChange={(keys) => {
            setCategoryFilter(Array.from(keys)[0] || "");
            setPage(1);
          }}
          classNames={selectStyle}
        >
          {categories.map((category) => (
            <SelectItem key={category._id}>{category.name}</SelectItem>
          ))}
        </Select>
        <Switch
          isSelected={lowOnly}
          onValueChange={(value) => {
            setLowOnly(value);
            setPage(1);
          }}
        >
          Low stock only
        </Switch>
      </div>

      {/* product cards */}
      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : products.length === 0 ? (
        <div className="glass mt-8 p-10 text-center text-white/70">
          No products found.{" "}
          {canEdit &&
            "Add one, or use Import Products to load a ready-made catalog."}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {products.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 12) * 0.04 }}
              className="glass glass-hover flex flex-col overflow-hidden"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-white/5">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-contain p-2"
                  />
                ) : (
                  <ImageIcon size={40} className="text-white/30" />
                )}
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <p className="text-xs uppercase tracking-wide text-white/50">
                  {product.category?.name || "Uncategorized"}
                </p>
                <h3 className="font-semibold leading-snug">{product.name}</h3>
                <p className="text-xs text-white/50">SKU: {product.sku}</p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-lg font-bold">
                    {money(product.price)}
                  </span>
                  <StockChip product={product} />
                </div>
                {canEdit && (
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      fullWidth
                      startContent={<Pencil size={14} />}
                      onPress={() => openEdit(product)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      color="danger"
                      isIconOnly
                      onPress={() => setDeleteTarget(product)}
                      aria-label="Delete"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
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

      {/* add / edit modal */}
      <Modal
        isOpen={modal.isOpen}
        onOpenChange={modal.onOpenChange}
        backdrop="blur"
        scrollBehavior="inside"
        size="3xl"
        classNames={modalStyle}
      >
        <ModalContent>
          <ModalHeader>
            {editingId ? "Edit product" : "Add product"}
          </ModalHeader>
          <ModalBody>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Product name"
                variant="bordered"
                value={form.name}
                onValueChange={setField("name")}
                isRequired
                classNames={inputStyle}
              />
              <Input
                label="SKU (auto if empty)"
                variant="bordered"
                value={form.sku}
                onValueChange={setField("sku")}
                classNames={inputStyle}
              />
              <Select
                label="Category"
                variant="bordered"
                isRequired
                selectedKeys={form.category ? [form.category] : []}
                onSelectionChange={(keys) =>
                  setField("category")(Array.from(keys)[0] || "")
                }
                classNames={selectStyle}
              >
                {categories.map((category) => (
                  <SelectItem key={category._id}>{category.name}</SelectItem>
                ))}
              </Select>
              <Select
                label="Supplier"
                variant="bordered"
                selectedKeys={form.supplier ? [form.supplier] : []}
                onSelectionChange={(keys) =>
                  setField("supplier")(Array.from(keys)[0] || "")
                }
                classNames={selectStyle}
              >
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier._id}>{supplier.name}</SelectItem>
                ))}
              </Select>
              <Input
                label="Selling price ($)"
                type="number"
                variant="bordered"
                value={form.price}
                onValueChange={setField("price")}
                isRequired
                classNames={inputStyle}
              />
              <Input
                label="Cost price ($)"
                type="number"
                variant="bordered"
                value={form.costPrice}
                onValueChange={setField("costPrice")}
                classNames={inputStyle}
              />
              <Input
                label="Stock quantity"
                type="number"
                variant="bordered"
                value={form.stock}
                onValueChange={setField("stock")}
                classNames={inputStyle}
              />
              <Input
                label="Low stock alert at"
                type="number"
                variant="bordered"
                value={form.lowStockLimit}
                onValueChange={setField("lowStockLimit")}
                classNames={inputStyle}
              />
              <Input
                label="Brand"
                variant="bordered"
                value={form.brand}
                onValueChange={setField("brand")}
                classNames={inputStyle}
              />
              <Input
                label="Image URL"
                variant="bordered"
                value={form.image}
                onValueChange={setField("image")}
                classNames={inputStyle}
              />
            </div>

            <Textarea
              label="Description"
              variant="bordered"
              value={form.description}
              onValueChange={setField("description")}
              classNames={inputStyle}
            />

            <div className="flex flex-wrap items-center gap-4">
              {form.image && (
                <img
                  src={form.image}
                  alt="Preview"
                  className="h-20 w-20 rounded-xl bg-white/5 object-contain"
                />
              )}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                <Upload size={16} />
                {uploading ? "Uploading..." : "Upload image (max 2MB)"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImage}
                  disabled={uploading}
                />
              </label>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="flat" onPress={modal.onClose}>
              Cancel
            </Button>
            <Button
              color="primary"
              onPress={handleSave}
              isLoading={saving}
              isDisabled={uploading}
            >
              Save product
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={saving}
        title="Delete product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
}
