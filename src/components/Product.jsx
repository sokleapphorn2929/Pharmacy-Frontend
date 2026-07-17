import React, { useEffect, useState } from "react";
import API from "../Api/api";

export default function Product() {
  const [product, setProduct] = useState([]);
  const [brands, setBrands] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const [isBrandModalOpen, setIsBrandModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showStatus = (title, message, type = "success") => {
    setStatusModal({ isOpen: true, title, message, type });
  };

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const token = localStorage.getItem("authToken");

        const requests = [
          API.get("/products"),
          API.get("https://pharmacy-system-backend-j77b.onrender.com/api/brands"),
        ];

        if (token) {
          requests.push(
            API.get("https://pharmacy-system-backend-j77b.onrender.com/api/favourites")
          );
        }

        const responses = await Promise.all(requests);

        setProduct(responses[0].data.data);
        setBrands(responses[1].data.data || responses[1].data);

        if (token && responses[2]) {
          const favData = responses[2].data.data || responses[2].data || [];
          setFavorites(
            favData.map((fav) => ({
              id: String(fav.id),
              product_id: String(fav.product_id),
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const findBrand = (brandId) => {
    return brands.find((b) => String(b.id) === String(brandId));
  };

  const handleOpenModal = (prod) => {
    setSelectedProduct(prod);
    setQuantity(1);
    setIsModalOpen(true);
  };

  const handleOpenBrandModal = (brandId) => {
    const brandData = findBrand(brandId);
    setSelectedBrand(
      brandData || {
        brand_name: "Unknown Brand",
        brand_location: "N/A",
        brand_detail: "none",
      }
    );
    setIsBrandModalOpen(true);
  };

  const handleToggleFavorite = async (productId) => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      showStatus("Authentication Required", "Please log in first to manage your favorites.", "info");
      return;
    }

    const searchId = String(productId);
    const existingFav = favorites.find((fav) => fav.product_id === searchId);
    const isFav = !!existingFav;

    try {
      if (isFav) {
        console.log(`Sending DELETE request for favorite ID: ${existingFav.id} with product_id: ${productId}`);

        await API.delete(
          `https://pharmacy-system-backend-j77b.onrender.com/api/favourites/${existingFav.id}`,
          {
            data: {
              product_id: productId,
            },
          }
        );

        setFavorites((prev) => prev.filter((fav) => fav.product_id !== searchId));
      } else {
        console.log("Sending POST request to add favorite");

        const response = await API.post(
          "https://pharmacy-system-backend-j77b.onrender.com/api/favourites",
          {
            product_id: productId,
          }
        );

        const newFavData = response.data?.data || response.data;
        const newFavId = newFavData?.id ? String(newFavData.id) : searchId;

        setFavorites((prev) => [...prev, { id: newFavId, product_id: searchId }]);
      }
    } catch (error) {
      console.error("Favorite Toggle Error:", error);
      const errMsg = error.response?.data?.message || "Failed to update favorite status.";
      showStatus("Error", errMsg, "error");
    }
  };

  const handleSaveToCart = async () => {
    if (!selectedProduct) return;

    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsModalOpen(false);
      setTimeout(() => {
        showStatus("Authentication Required", "Please log in first to add items to your cart.", "info");
      }, 100);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product_id: selectedProduct.id,
        qty: quantity,
      };

      await API.post("/cards", payload);

      window.dispatchEvent(new Event("cart-updated"));
      setIsModalOpen(false);
      
      setTimeout(() => {
        showStatus(
          "Added to Cart", 
          `Successfully saved ${quantity}x "${selectedProduct.product_name}" to your shopping cart!`, 
          "success"
        );
      }, 100);
    } catch (error) {
      console.error("Cart Error Details:", error);
      const serverErrorMessage = error.response?.data?.message || "Failed to save item to cart. Please try again.";
      setIsModalOpen(false);
      setTimeout(() => {
        showStatus("Cart Error", serverErrorMessage, "error");
      }, 100);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      <div className="mb-8">
        <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
          Trending Products
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore our top-selling healthcare essentials and wellness formulations.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="animate-pulse bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-5 h-80 flex flex-col justify-between"
              >
                <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 mt-4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2 mt-2" />
                <div className="flex justify-between items-center mt-4">
                  <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4" />
                  <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                </div>
              </div>
            ))
          : product.map((prod) => {
              const isAvailable = prod.product_status === "available";
              const hasDiscount = parseFloat(prod.product_discount) > 0;
              const parsedPrice = parseFloat(prod.product_price);
              
              const isFavorited = favorites.some((fav) => fav.product_id === String(prod.id));

              return (
                <div
                  key={prod.id}
                  className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="w-full h-48 sm:h-52 overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
                      <img
                        src={prod.product_pic}
                        alt={prod.product_name}
                        className={`w-full h-full object-cover select-none transform group-hover:scale-105 transition-transform duration-500 ${!isAvailable ? "opacity-50 grayscale" : ""}`}
                      />

                      <button
                        onClick={() => handleToggleFavorite(prod.id)}
                        className="absolute top-3 right-3 p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm hover:bg-white dark:hover:bg-slate-900 transition-colors duration-200 z-10"
                      >
                        <svg
                          className={`w-5 h-5 transition-colors duration-200 ${isFavorited ? "fill-rose-500 stroke-rose-500" : "stroke-slate-600 dark:stroke-slate-300 fill-none"}`}
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="p-5 pb-2">
                      <div className="flex items-center justify-between gap-2 text-[10px] font-bold tracking-wider uppercase">
                        <span className="text-slate-400 dark:text-slate-500">
                          Expires: {prod.product_expired_date}
                        </span>
                        <div className="flex items-center gap-1.5 normal-case">
                          {hasDiscount && isAvailable && (
                            <span className="bg-amber-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                              -{prod.product_discount}%
                            </span>
                          )}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${isAvailable ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" : "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400"}`}
                          >
                            {isAvailable ? "In Stock" : "OOS"}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mt-2 line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors uppercase">
                        {prod.product_name}
                      </h3>

                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mt-1 min-h-8">
                        {prod.product_detail !== "none"
                          ? prod.product_detail
                          : "No secondary descriptions specified."}
                      </p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 mt-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ${parsedPrice.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleOpenModal(prod)}
                        disabled={!isAvailable}
                        className="p-3 bg-[#0f172a] dark:bg-slate-700 hover:bg-[#1e293b] dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-2xl shadow-md transition-all duration-150 disabled:cursor-not-allowed"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto transform transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Product Details
                </h3>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block mt-0.5">
                  ID: {selectedProduct.id}
                </span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 border-b border-slate-100 dark:border-slate-700/60 pb-5 mb-5">
              <div className="w-full sm:w-1/3 h-32 rounded-2xl bg-slate-50 dark:bg-slate-900 overflow-hidden relative shrink-0">
                <img
                  src={selectedProduct.product_pic}
                  alt={selectedProduct.product_name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-extrabold text-slate-900 dark:text-white uppercase leading-snug">
                    {selectedProduct.product_name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">
                    {selectedProduct.product_detail !== "none"
                      ? selectedProduct.product_detail
                      : "No secondary descriptions specified."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-50 dark:border-slate-700/30 text-[11px]">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">
                      Availability Status
                    </span>
                    <span
                      className={`font-bold capitalize ${selectedProduct.product_status === "available" ? "text-emerald-500" : "text-rose-500"}`}
                    >
                      {selectedProduct.product_status === "available" ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 block font-medium">
                      Manufacturer Brand
                    </span>
                    <button
                      onClick={() => handleOpenBrandModal(selectedProduct.brand_id)}
                      className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold underline line-clamp-1 text-left uppercase"
                    >
                      {findBrand(selectedProduct.brand_id)?.brand_name || "View Brand Details"} →
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4 text-center">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2">
                Select Quantity
              </span>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-xl font-extrabold text-slate-800 dark:text-white"
                >
                  -
                </button>
                <span className="text-2xl font-black text-slate-900 dark:text-white w-12 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-11 h-11 bg-slate-100 dark:bg-slate-700 rounded-xl font-extrabold text-slate-800 dark:text-white"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-400">
                  Unit Price: ${parseFloat(selectedProduct.product_price).toFixed(2)}
                </span>
                <span className="text-xs font-bold text-slate-500 mt-0.5">
                  Estimated Total:
                </span>
              </div>
              <span className="text-2xl font-black text-slate-950 dark:text-white">
                ${(parseFloat(selectedProduct.product_price) * quantity).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToCart}
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md"
              >
                {submitting ? "Saving..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isBrandModalOpen && selectedBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <div className="flex justify-between items-start mb-5">
              <div>
                <span className="text-[10px] bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold tracking-widest uppercase px-2.5 py-1 rounded-md">
                  Brand Profile Review
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-2">
                  {selectedBrand.brand_name}
                </h3>
              </div>
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {selectedBrand.brand_pic && (
              <div className="w-full h-44 rounded-2xl bg-slate-100 dark:bg-slate-900 overflow-hidden relative border border-slate-100 dark:border-slate-700/40 mb-4">
                <img
                  src={selectedBrand.brand_pic}
                  alt={selectedBrand.brand_name}
                  className="w-full h-full object-cover select-none"
                />
              </div>
            )}

            <div className="space-y-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl mb-6">
              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                  Headquarters Location
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1 mt-0.5">
                  📍 {selectedBrand.brand_location || "Not specified"}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                  Corporate Profile & Summary
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  {selectedBrand.brand_detail !== "none"
                    ? selectedBrand.brand_detail
                    : "No corporate background details specified by this manufacturer."}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsBrandModalOpen(false)}
                className="w-full bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold py-2.5 rounded-xl transition-colors shadow-sm"
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}

      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
            
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-2xl mb-4">
              {statusModal.type === "success" && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              {statusModal.type === "error" && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              )}
              {statusModal.type === "info" && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
              {statusModal.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {statusModal.message}
            </p>

            <button
              onClick={closeStatusModal}
              className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}