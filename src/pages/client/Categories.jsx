import React from "react";
import { Link } from "react-router-dom";
import { useCollection } from "../../hooks/useFirestore";
import Loader from "../../components/common/Loader";
import CategoryCard from "../../components/ui/CategoryCard";

export default function Categories() {
  const { data: categories, loading } = useCollection("categories");

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900">All Categories</h1>
        <p className="text-gray-500 mt-2">
          Browse our complete range of product categoriespy
        </p>
      </div>

      {loading ? (
        <Loader className="py-20" />
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No categories available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              className="min-w-0 aspect-square"
            />
          ))}
        </div>
      )}
    </div>
  );
}
