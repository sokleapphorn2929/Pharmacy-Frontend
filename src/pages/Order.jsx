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

  const handleDownloadInvoice = async (orderId) => {
    try {
      const invRes = await API.get(`/invoices/by-order/${orderId}`);
      const invoiceId = invRes.data.data._id || invRes.data.data.id;

      const res = await API.get(`/invoices/download/${invoiceId}`);
      const invoiceData = res.data.data;

      const currentOrder = orders.find((o) => (o._id || o.id) === orderId);

      const printWindow = window.open("", "_blank");
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice_${invoiceData.invoice_number}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
              .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
              .header h2 { margin: 0; color: #0f172a; font-size: 28px; font-weight: 900; }
              .details { display: flex; justify-content: space-between; margin-bottom: 40px; }
              .details p { margin: 5px 0; font-size: 14px; }
              table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              th { background-color: #f8fafc; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #64748b; border-bottom: 2px solid #e2e8f0; }
              td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
              .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>KH PHARMACY.</h2>
              <p style="color: #64748b; margin-top: 5px;">Official Invoice</p>
            </div>
            
            <div class="details">
              <div>
                <strong>Invoice Number:</strong> ${invoiceData.invoice_number}<br>
                <strong>Date:</strong> ${new Date(invoiceData.invoice_create_at).toLocaleDateString()}
              </div>
              <div style="text-align: right;">
                <strong>Order ID:</strong> ${orderId}
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th style="text-align: right;">Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${
                  currentOrder?.order_items
                    ?.map(
                      (item) => `
                  <tr>
                    <td>${item.products?.product_name || "Product"}</td>
                    <td>${item.qty}</td>
                    <td style="text-align: right;">$${parseFloat(item.price).toFixed(2)}</td>
                    <td style="text-align: right;">$${(parseFloat(item.price) * parseInt(item.qty)).toFixed(2)}</td>
                  </tr>
                `,
                    )
                    .join("") || '<tr><td colspan="4">No items found</td></tr>'
                }
              </tbody>
            </table>

            <div class="total">
              Grand Total: $${currentOrder?.order_items?.reduce((sum, item) => sum + parseFloat(item.price) * parseInt(item.qty), 0).toFixed(2) || "0.00"}
            </div>

            <script>
              // Wait for styles to load, then trigger print dialog, then close tab
              window.onload = function() { 
                window.print(); 
                // Optional: window.close(); if you want the tab to auto-close after printing
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("An invoice has not been generated for this order yet.");
      } else {
        console.error("Error details:", error.response || error);
        alert("Failed to download. Check console for details.");
      }
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

                      {order.order_status === "completed" && (
                        <button
                          onClick={() => handleDownloadInvoice(orderId)}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase rounded-lg transition-colors"
                        >
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Invoice PDF
                        </button>
                      )}

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
