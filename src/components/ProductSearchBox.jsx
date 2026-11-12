"use client";

import { useEffect, useState } from "react";
import { Input } from "@heroui/react";
import { Search } from "lucide-react";
import api from "@/lib/api";
import { inputStyle } from "@/lib/ui";

export default function ProductSearchBox({ onPick }) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get("/products", {
          params: { search, limit: 6 },
        });
        setResults(data.products);
      } catch (error) {
        setResults([]);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  const pick = (product) => {
    onPick(product);
    setSearch("");
    setResults([]);
  };

  return (
    <div className="relative">
      <Input
        placeholder="Search a product to add (name, SKU or brand)"
        variant="bordered"
        value={search}
        onValueChange={setSearch}
        startContent={<Search size={16} />}
        classNames={inputStyle}
        aria-label="Search products"
      />
      {results.length > 0 && (
        <div className="absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-xl border border-white/20 bg-[#161436]/95 shadow-xl backdrop-blur-xl">
          {results.map((product) => (
            <button
              key={product._id}
              type="button"
              onClick={() => pick(product)}
              className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-white/10"
            >
              <span className="truncate">{product.name}</span>
              <span className="shrink-0 text-xs text-white/50">
                {product.sku} · stock {product.stock}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
