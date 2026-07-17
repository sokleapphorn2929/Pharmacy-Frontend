import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../Api/api";

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  const showStatus = (title, message, type = "success") => {
    setStatusModal({ isOpen: true, title, message, type });
  };

  const showConfirm = (title, message, onConfirm) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  useEffect(() => {
    async function fetchCartData() {
      try {
        const [cartRsp, productsRsp] = await Promise.all([
          API.get("/cards"),
          API.get("/products"),
        ]);

        setCartItems(cartRsp.data.data || cartRsp.data || []);
        setProducts(productsRsp.data.data || productsRsp.data || []);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCartData();
  }, []);

  const getProductDetails = (productId) => {
    return products.find((p) => String(p.id) === String(productId)) || {};
  };

  const handleUpdateQuantity = async (
    cartId,
    productId,
    currentQty,
    amount,
  ) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;

    setUpdatingId(cartId);
    try {
      await API.put(`/cards/${cartId}`, {
        qty: newQty,
      });

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === cartId ? { ...item, qty: newQty } : item,
        ),
      );

      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      showStatus("Update Failed", "Could not change item quantity. Please try again.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  const executeRemoveItem = async (cartId) => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
    try {
      await API.delete(`/cards/${cartId}`);

      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== cartId),
      );

      window.dispatchEvent(new Event("cart-updated"));
      showStatus("Item Removed", "The product has been successfully removed from your bag.", "success");
    } catch (error) {
      console.error("Error removing item:", error);
      showStatus("Deletion Failed", "Failed to delete item from your cart setup.", "error");
    }
  };

  const handleRemoveItem = (cartId) => {
    showConfirm(
      "Remove Product?",
      "Are you sure you want to remove this pharmacy item from your active shopping cart list?",
      () => executeRemoveItem(cartId)
    );
  };

  const totalItems = cartItems.reduce(
    (acc, item) => acc + parseInt(item.qty || 0),
    0,
  );

  const subtotal = cartItems.reduce((acc, item) => {
    const productInfo = getProductDetails(item.product_id);
    const price = parseFloat(productInfo.product_price || 0);
    return acc + price * parseInt(item.qty || 0);
  }, 0);

  const deliveryFee = subtotal > 0 ? 2.0 : 0.0;
  const grandTotal = subtotal + deliveryFee;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Loading your medical shopping cart...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 py-12 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800/80 pb-5">
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
            Shopping Cart ({totalItems} items)
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Review your selected healthcare formulas and pharmacy items before checking out.
          </p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700/60 rounded-3xl p-8 max-w-lg mx-auto shadow-sm">
            <div className="text-4xl mb-4">🛒</div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-wide">
              Your cart is empty
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-6 px-4">
              It looks like you haven't added any medicinal compounds or products to your bag yet.
            </p>
            <Link
              to="/kh/home"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              &larr; Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const productInfo = getProductDetails(item.product_id);
                const price = parseFloat(productInfo.product_price || 0);
                const itemTotal = price * parseInt(item.qty || 0);

                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-2xl p-4 sm:p-5 flex gap-4 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.01)] relative"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-slate-50 dark:bg-slate-900 overflow-hidden shrink-0 border border-slate-100 dark:border-slate-700/40">
                      <img
                        src={productInfo.product_pic || "https://via.placeholder.com/150"}
                        alt={productInfo.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between gap-2 items-start">
                        <div>
                          <h4 className="font-bold text-sm sm:text-base text-slate-800 dark:text-white uppercase line-clamp-1">
                            {productInfo.product_name || "Loading product info..."}
                          </h4>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider block mt-0.5">
                            SKU ID: {item.product_id}
                          </span>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-300 hover:text-rose-500 dark:text-slate-600 dark:hover:text-rose-400 p-1 rounded-lg transition-colors duration-150 shrink-0"
                          title="Delete entry"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50 dark:border-slate-700/30">
                        <div className="flex items-center gap-2.5 bg-slate-50 dark:bg-slate-900/40 px-2.5 py-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
                          <button
                            disabled={updatingId === item.id || item.qty <= 1}
                            onClick={() => handleUpdateQuantity(item.id, item.product_id, item.qty, -1)}
                            className="w-7 h-7 flex items-center justify-center font-bold text-sm bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-white border border-slate-200/40 dark:border-slate-600 shadow-sm transition-colors disabled:opacity-40"
                          >
                            -
                          </button>

                          <span className="text-sm font-black text-slate-900 dark:text-white w-6 text-center select-none">
                            {item.qty}
                          </span>

                          <button
                            disabled={updatingId === item.id}
                            onClick={() => handleUpdateQuantity(item.id, item.product_id, item.qty, 1)}
                            className="w-7 h-7 flex items-center justify-center font-bold text-sm bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-lg text-slate-600 dark:text-white border border-slate-200/40 dark:border-slate-600 shadow-sm transition-colors disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 dark:text-slate-500 block font-semibold">
                            ${price.toFixed(2)} each
                          </span>
                          <span className="font-extrabold text-base text-slate-900 dark:text-white block mt-0.5">
                            ${itemTotal.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-xl relative">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Order Summary
              </h3>

              <div className="space-y-3 text-sm pb-4 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Subtotal</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 dark:text-slate-500 font-medium">Estimated Delivery</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">${deliveryFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center my-5">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-300">Total Amount</span>
                <span className="text-2xl font-black text-slate-950 dark:text-white">${grandTotal.toFixed(2)}</span>
              </div>

              <button
                onClick={() => showStatus("Checkout Proceeding", "Redirecting you to the secure checkout terminal overview framework...", "info")}
                className="w-full py-3.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 uppercase tracking-wide flex items-center justify-center gap-2"
              >
                Secure Checkout &rarr;
              </button>

              <Link
                to="/kh/home"
                className="w-full mt-3 inline-flex items-center justify-center py-2.5 text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold uppercase transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </div>

      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
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

            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{statusModal.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{statusModal.message}</p>

            <button
              onClick={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
              className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-2xl mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{confirmModal.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{confirmModal.message}</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="w-1/2 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className="w-1/2 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}