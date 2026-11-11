"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner,
  Chip,
} from "@heroui/react";
import { Search, Download, Star } from "lucide-react";
import { toast } from "react-toastify";
import api, { getErrorMessage } from "@/lib/api";
import { money } from "@/lib/format";
import ProtectedRoute from "@/components/ProtectedRoute";
import { inputStyle, selectStyle } from "@/lib/ui";

const BASE_URL = "https://dummyjson.com/products";
const PAGE_SIZE = 12;

function DummyProductsContent() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [importingId, setImportingId] = useState(null);
  const [importingAll, setImportingAll] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // category list from DummyJSON
  useEffect(() => {
    axios
      .get(`${BASE_URL}/category-list`)
      .then(({ data }) => setCategories(data))
      .catch(() => {});
  }, []);

  // product list from DummyJSON
  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        let url = BASE_URL;
        const params = { limit: PAGE_SIZE, skip: (page - 1) * PAGE_SIZE };

        if (debouncedSearch) {
          url = `${BASE_URL}/search`;
          params.q = debouncedSearch;
        } else if (category) {
          url = `${BASE_URL}/category/${category}`;
        }

        const { data } = await axios.get(url, { params });
        setItems(data.products);
        setPages(Math.ceil(data.total / PAGE_SIZE) || 1);
      } catch (error) {
        toast.error("Could not load products from DummyJSON");
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [page, debouncedSearch, category]);

  // send only the fields we need to our own API
  const toPayload = (product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    category: product.category,
    price: product.price,
    stock: product.stock,
    brand: product.brand,
    sku: product.sku,
    thumbnail: product.thumbnail,
  });

  const importProducts = async (list) => {
    const { data } = await api.post("/products/import", {
      products: list.map(toPayload),
    });
    toast.success(
      `${data.imported} imported, ${data.skipped} skipped (already in catalog)`,
    );
  };

  const importOne = async (product) => {
    setImportingId(product.id);
    try {
      await importProducts([product]);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setImportingId(null);
    }
  };

  const importPage = async () => {
    setImportingAll(true);
    try {
      await importProducts(items);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setImportingAll(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Import products</h1>
          <p className="text-white/70">
            Browse the live catalog from dummyjson.com and add products to your
            inventory.
          </p>
        </div>
        <Button
          color="primary"
          startContent={<Download size={18} />}
          onPress={importPage}
          isLoading={importingAll}
          isDisabled={loading || items.length === 0}
        >
          Import all on this page
        </Button>
      </div>

      <div className="glass mt-6 grid grid-cols-1 gap-4 p-4 md:grid-cols-2">
        <Input
          placeholder="Search DummyJSON products"
          variant="bordered"
          value={search}
          onValueChange={(value) => {
            setSearch(value);
            if (value) setCategory("");
          }}
          startContent={<Search size={16} />}
          classNames={inputStyle}
          aria-label="Search products"
        />
        <Select
          placeholder="All categories"
          variant="bordered"
          aria-label="Filter by category"
          selectedKeys={category ? [category] : []}
          onSelectionChange={(keys) => {
            setCategory(Array.from(keys)[0] || "");
            setSearch("");
            setPage(1);
          }}
          classNames={selectStyle}
        >
          {categories.map((name) => (
            <SelectItem key={name}>{name}</SelectItem>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="mt-16 flex justify-center">
          <Spinner color="primary" />
        </div>
      ) : items.length === 0 ? (
        <div className="glass mt-8 p-10 text-center text-white/70">
          No products match your search.
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(index, 12) * 0.04 }}
              className="glass glass-hover flex flex-col overflow-hidden"
            >
              <div className="flex aspect-[4/3] items-center justify-center bg-white/5">
                <img
                  src={product.thumbnail}
                  alt={product.title}
                  className="h-full w-full object-contain p-2"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <Chip size="sm" variant="flat" className="capitalize">
                    {product.category.replace(/-/g, " ")}
                  </Chip>
                  <span className="flex items-center gap-1 text-sm text-amber-300">
                    <Star size={14} fill="currentColor" /> {product.rating}
                  </span>
                </div>
                <h3 className="font-semibold leading-snug">{product.title}</h3>
                <p className="text-xs text-white/50">
                  {product.brand || "No brand"} · {product.stock} in stock
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <span className="text-lg font-bold">
                    {money(product.price)}
                  </span>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    onPress={() => importOne(product)}
                    isLoading={importingId === product.id}
                  >
                    Import
                  </Button>
                </div>
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
    </div>
  );
}

export default function DummyProductsPage() {
  return (
    <ProtectedRoute roles={["admin", "manager"]}>
      <DummyProductsContent />
    </ProtectedRoute>
  );
}
