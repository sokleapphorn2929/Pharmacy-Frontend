import React, { useEffect, useState } from "react";
// 1. Import your custom API instance instead of raw axios
// Adjust the import path relative to where your api.js file is located
import API from "../Api/api"; 

export default function Product() {
  const [product, setProduct] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function getProduct() {
      try {
        // 2. Use API instance with relative endpoint path
        const rsp = await API.get("/products");
        setProduct(rsp.data.data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
    getProduct();
  }, []);

  const handleOpenModal = (prod) => {
    setSelectedProduct(prod);
    setQuantity(1); 
    setIsModalOpen(true);
  };

  const handleSaveToCart = async () => {
    if (!selectedProduct) return;
    
    // 3. Keep the preemptive local check so we don't send a request if missing entirely
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Please login first to add items to your cart.");
      setIsModalOpen(false);
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        product_id: selectedProduct.id,
        qty: quantity
      };

      // 4. Hit the relative endpoint without passing manual headers config
      await API.post("/cards", payload);
      
      alert(`Successfully saved ${quantity}x "${selectedProduct.product_name}" to your cart!`);
      setIsModalOpen(false);
    } catch (error) {
      console.error("Cart Error Details:", error);
      
      const serverErrorMessage = 
        error.response?.data?.message || 
        "Failed to save item to cart. Please try again.";
        
      alert(serverErrorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-12">
      {/* Header Area */}
      <div className="mb-8">
        <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
          Trending Products
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Explore our top-selling healthcare essentials and wellness formulations.
        </p>
      </div>

      {/* Responsive Grid Track */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="animate-pulse bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-5 h-80 flex flex-col justify-between">
              <div className="w-full h-40 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4 mt-4" />
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2 mt-2" />
              <div className="flex justify-between items-center mt-4">
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4" />
                <div className="h-10 w-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
              </div>
            </div>
          ))
        ) : (
          product.map((prod) => {
            const isAvailable = prod.product_status === "available";
            const hasDiscount = parseFloat(prod.product_discount) > 0;
            const parsedPrice = parseFloat(prod.product_price);

            return (
              <div
                key={prod.id}
                className="group relative bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl overflow-hidden shadow-[0_4px_25px_-5px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
                  {!isAvailable && (
                    <span className="bg-rose-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                      Out of Stock
                    </span>
                  )}
                  {isAvailable && hasDiscount && (
                    <span className="bg-amber-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-sm">
                      -{prod.product_discount}%
                    </span>
                  )}
                </div>

                <div>
                  <div className="w-full h-48 sm:h-52 overflow-hidden bg-slate-50 dark:bg-slate-900 relative">
                    <img
                      src={prod.product_pic}
                      alt={prod.product_name}
                      className={`w-full h-full object-cover select-none transform group-hover:scale-105 transition-transform duration-500 ${
                        !isAvailable ? "opacity-50 grayscale" : ""
                      }`}
                    />
                  </div>

                  <div className="p-5 pb-2">
                    <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase block">
                      Expires: {prod.product_expired_date}
                    </span>

                    <h3 className="font-bold text-base text-slate-800 dark:text-slate-100 mt-1 line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors uppercase">
                      {prod.product_name}
                    </h3>
                    
                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mt-1 min-h-8">
                      {prod.product_detail !== "none" ? prod.product_detail : "No secondary descriptions specified."}
                    </p>
                  </div>
                </div>

                <div className="p-5 pt-0 mt-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-xl font-black text-slate-900 dark:text-white">
                        ${parsedPrice.toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenModal(prod)}
                      disabled={!isAvailable}
                      className="p-3 bg-[#0f172a] dark:bg-slate-700 hover:bg-[#1e293b] dark:hover:bg-slate-600 disabled:bg-slate-100 dark:disabled:bg-slate-800 text-white disabled:text-slate-400 rounded-2xl shadow-md transition-all duration-150 disabled:cursor-not-allowed"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quantity Modal Overlay */}
      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-scaleIn">
            
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 uppercase">
              Select Quantity
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
              How many units of <span className="font-bold text-blue-500">{selectedProduct.product_name}</span> do you want to add?
            </p>

            <div className="flex items-center justify-center gap-4 mb-8">
              <button 
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-extrabold text-slate-800 dark:text-white transition-colors"
              >
                -
              </button>
              
              <span className="text-2xl font-black text-slate-900 dark:text-white w-12 text-center select-none">
                {quantity}
              </span>

              <button 
                onClick={() => setQuantity((q) => q + 1)}
                className="w-12 h-12 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-extrabold text-slate-800 dark:text-white transition-colors"
              >
                +
              </button>
            </div>

            <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-800">
              <span className="text-sm font-semibold text-slate-500">Estimated Total:</span>
              <span className="text-xl font-black text-slate-950 dark:text-white">
                ${(parseFloat(selectedProduct.product_price) * quantity).toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSaveToCart}
                disabled={submitting}
                className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}