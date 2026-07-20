import axios from "axios";
import React, { useEffect, useState } from "react";

export default function Category() {
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    axios
      .get("https://pharmacy-system-backend-j77b.onrender.com/api/categories")
      .then((response) => {
        setCategory(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  }, []);

  const displayedCategories = showAll ? category : category.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
            Shop by Categories
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Find everything you need arranged by medical classifications.
          </p>
        </div>

        {!loading && category.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm font-semibold text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5 group"
          >
            {showAll ? "Show Less" : "View All Categories"}
            <svg
              className={`w-4 h-4 transform transition-transform duration-300 ${showAll ? "rotate-180" : "group-hover:translate-y-0.5"}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-all duration-500">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-4 text-center"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl bg-slate-200 dark:bg-slate-700 mb-4" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 mx-auto mb-2" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2 mx-auto" />
              </div>
            ))
          : displayedCategories.map((item) => (
              <div
                key={item.id}
                className="group cursor-pointer bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-4 text-center shadow-[0_4px_20px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
              >
                <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden mb-4 shadow-sm border border-slate-100 dark:border-slate-700 transform group-hover:scale-105 transition-transform duration-300 flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                  {item.category_pic ? (
                    <img
                      src={item.category_pic}
                      alt={item.category_name}
                      className="w-full h-full object-cover select-none pointer-events-none"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = item.category_name
                          .charAt(0)
                          .toUpperCase();
                      }}
                    />
                  ) : (
                    <span className="text-3xl font-black text-slate-400 dark:text-slate-500">
                      {item.category_name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm md:text-base text-slate-800 dark:text-slate-200 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {item.category_name}
                </h3>
                <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">
                  {item.products_count !== undefined
                    ? `${item.products_count} ${item.products_count === 1 ? "Product" : "Products"}`
                    : "0 Products"}
                </p>
              </div>
            ))}
      </div>
    </div>
  );
}
