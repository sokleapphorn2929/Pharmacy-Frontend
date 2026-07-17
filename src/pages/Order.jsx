import React, { useEffect, useState } from "react";
import API from "../Api/api";

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  const confirmDelete = (orderId) => {
    setOrderToDelete(orderId);
    setShowModal(true);
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      await API.delete(`/orders/${orderToDelete}`);
      setOrders(
        orders.filter((order) => (order._id || order.id) !== orderToDelete),
      );
      setShowModal(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
    }
  };

  useEffect(() => {
    async function fetchOrders() {
      try {
        const response = await API.get("/orders");
        setOrders(response.data.data || response.data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 py-12 pt-20 px-4">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
          My Order History
        </h2>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-sm w-full shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Delete Order?
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">
                Are you sure? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 font-semibold text-slate-700 dark:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteOrder}
                  className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 font-semibold text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No orders found.
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const orderId = order._id || order.id;
              return (
                <div
                  key={orderId}
                  className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase">
                        Order ID: #{orderId}
                      </p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">
                        Date: {new Date(order.order_date).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span
                        className={`px-2 py-1 text-[10px] font-black uppercase rounded-lg ${
                          order.order_status === "completed"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : order.order_status === "pending"
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                              : order.order_status === "cancelled"
                                ? "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400"
                                : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400" // rejected/default
                        }`}
                      >
                        {order.order_status || "Pending"}
                      </span>

                      <button
                        onClick={() => confirmDelete(orderId)}
                        className="text-slate-400 hover:text-rose-500 transition-colors"
                        title="Delete Order"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-3">
                      Ordered Items
                    </h4>
                    <div className="space-y-2">
                      {order.order_items &&
                        order.order_items.map((item) => (
                          <div
                            key={item._id || item.id}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-700 dark:text-slate-300">
                              {item.products?.product_name || "Product"}{" "}
                              <span className="text-slate-400">
                                x{item.qty}
                              </span>
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white">
                              $
                              {(
                                parseFloat(item.price) * parseInt(item.qty)
                              ).toFixed(2)}
                            </span>
                          </div>
                        ))}
                    </div>

                    <div className="mt-4 text-right pt-3 border-t border-dashed border-slate-300 dark:border-slate-700">
                      <span className="font-black text-slate-900 dark:text-white text-lg">
                        Total: $
                        {order.order_items
                          ?.reduce(
                            (sum, item) =>
                              sum + parseFloat(item.price) * parseInt(item.qty),
                            0,
                          )
                          .toFixed(2)}
                      </span>
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
