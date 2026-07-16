import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../Api/api";

const FAVOURITES_URL = "https://pharmacy-system-backend-j77b.onrender.com/api/favourites";

export default function Favourite() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState({});
  
  const isLoggedIn = !!localStorage.getItem("authToken");

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    async function fetchFavorites() {
      try {
        const token = localStorage.getItem("authToken");

        const response = await API.get(FAVOURITES_URL, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        
        const favData = response.data?.data || response.data || [];
        setFavorites(Array.isArray(favData) ? favData : []);
      } catch (error) {
        console.error("Error fetching favorites:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [isLoggedIn]);

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const token = localStorage.getItem("authToken");

      await API.delete(`${FAVOURITES_URL}/${favoriteId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setFavorites((prev) => prev.filter((fav) => (fav.id || fav._id) !== favoriteId));
    } catch (error) {
      console.error("Failed to remove favorite item:", error);
      alert(error.response?.data?.message || "Could not remove item from favorites.");
    }
  };

  const handleAddToCart = async (product) => {
    const prodId = product._id || product.id;
    if (!prodId) return;

    setCartLoading((prev) => ({ ...prev, [prodId]: true }));
    try {
      const token = localStorage.getItem("authToken");
      
      await API.post(
        "/cards",
        {
          product_id: prodId,
          qty: 1,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      window.dispatchEvent(new Event("cart-updated"));
      alert(`${product.product_name || "Product"} added to cart!`);
    } catch (error) {
      console.error("Failed to add item to cart:", error);
      alert(error.response?.data?.message || "Failed to add item to cart.");
    } finally {
      setCartLoading((prev) => ({ ...prev, [prodId]: false }));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col justify-center items-center px-4">
        <div className="text-4xl mb-3">🔒</div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white uppercase tracking-wide">Access Denied</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 text-center max-w-xs">
          Please log in to your account to view your saved items.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Loading your saved items...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 py-12 pt-20 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-5">
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
            My Saved Items ({favorites.length})
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quickly review and manage your preferred pharmaceutical choices and formula items.
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700/60 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
            <div className="text-4xl mb-4">❤️</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wide">
              No saved items yet
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-6 px-4">
              It looks like you haven't added any medicinal compounds or products to your wishlist yet.
            </p>
            <Link
              to="/kh/home"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              ← Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {favorites.map((fav) => {
              const prod = fav.products;
              const favId = fav.id || fav._id;
              const prodId = prod?._id || prod?.id;

              if (!prod) {
                return (
                  <div key={favId || Math.random()} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-rose-200 dark:border-rose-900/40 text-center flex flex-col justify-center items-center shadow-sm">
                    <p className="text-xs text-rose-500 font-bold">⚠️ Product Data Missing</p>
                    <p className="text-[10px] text-slate-400 mt-1">Ref ID: {favId || 'N/A'}</p>
                    <button 
                      onClick={() => handleRemoveFavorite(favId)}
                      className="mt-3 text-xs text-slate-400 underline hover:text-rose-500 transition-colors"
                    >
                      Delete Broken Reference
                    </button>
                  </div>
                );
              }

              const isAvailable = prod.product_status === "available";
              const discountValue = parseFloat(prod.product_discount || 0);
              const hasDiscount = discountValue > 0;
              const originalPrice = parseFloat(prod.product_price || 0);
              
              const finalPrice = hasDiscount 
                ? originalPrice - (originalPrice * discountValue) / 100 
                : originalPrice;

              return (
                <div
                  key={favId}
                  className="group relative bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="w-full h-48 overflow-hidden bg-slate-50 dark:bg-slate-900 relative border-b border-gray-100 dark:border-slate-800">
                    <Link to={`/kh/product/${prodId || ""}`} className="block w-full h-full">
                      <img
                        src={prod.product_pic || "https://via.placeholder.com/150"}
                        alt={prod.product_name || "Product"}
                        className={`w-full h-full object-cover select-none transition-transform duration-500 group-hover:scale-105 ${
                          !isAvailable ? "opacity-40 grayscale" : ""
                        }`}
                        loading="lazy"
                      />
                    </Link>

                    {hasDiscount && isAvailable && (
                      <span className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-lg shadow-sm z-10">
                        -{prod.product_discount}% OFF
                      </span>
                    )}

                    <button
                      onClick={() => handleRemoveFavorite(favId)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm shadow-sm hover:bg-rose-50 dark:hover:bg-rose-950/40 group/btn transition-colors duration-150 z-10"
                      title="Remove from saved items"
                    >
                      <svg
                        className="w-4 h-4 fill-rose-500 stroke-rose-500 group-hover/btn:fill-rose-600 group-hover/btn:stroke-rose-600 transition-colors"
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

                    {!isAvailable && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                        <span className="bg-slate-900/80 text-white font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Exp: {prod.product_expired_date || "N/A"}</span>
                      </div>

                      <h4 className="font-bold text-base text-slate-800 dark:text-white line-clamp-1 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-1">
                        <Link to={`/kh/product/${prodId || ""}`}>
                          {prod.product_name}
                        </Link>
                      </h4>

                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 min-h-[2rem] leading-relaxed">
                        {prod.product_detail && prod.product_detail !== "none"
                          ? prod.product_detail
                          : "No dynamic description specified for this pharmacy product line."}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-700/40">
                      <div className="flex items-baseline gap-2 mb-3">
                        <span className="font-black text-lg text-slate-900 dark:text-white">
                          ${finalPrice.toFixed(2)}
                        </span>
                        {hasDiscount && isAvailable && (
                          <span className="text-xs text-slate-400 dark:text-slate-500 line-through font-medium">
                            ${originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(prod)}
                        disabled={!isAvailable || cartLoading[prodId]}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all duration-150 flex items-center justify-center gap-2 ${
                          isAvailable
                            ? "bg-blue-500 hover:bg-blue-600 text-white hover:shadowactive:scale-[0.99]"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed"
                        }`}
                      >
                        {cartLoading[prodId] ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        )}
                        {isAvailable ? "Add to Cart" : "Unavailable"}
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}