import React, { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCollection } from "../../hooks/useFirestore";
import ProductCard from "../../components/ui/ProductCard";
import Loader from "../../components/common/Loader";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("category") || "";
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const perPage = 12;

  const { data: products, loading: prodLoading } = useCollection("products");
  const { data: categories, loading: catLoading } = useCollection("categories");

  const filtered = useMemo(() => {
    let result = products;
    if (categoryFilter) {
      result = result.filter((p) => p.categoryId === categoryFilter);
    }
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.title?.toLowerCase().includes(s) ||
          p.description?.toLowerCase().includes(s),
      );
    }
    return result;
  }, [products, categoryFilter, search]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const handleCategoryChange = (catId) => {
    setPage(1);
    if (catId) {
      setSearchParams({ category: catId });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-500 mt-2">
          Explore our complete product catalogpj
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="input-field max-w-md"
        />
        {!catLoading && (
          <select
            value={categoryFilter}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Products */}
      {prodLoading ? (
        <Loader className="py-20" />
      ) : paginated.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No products found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {paginated.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                    p === page
                      ? "bg-emerald-600 text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
