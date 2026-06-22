import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import OrderItemPreview from "./OrderItemPreview";
import { formatPrice, formatDate } from "../../utils/format";
import { API_BASE_URL } from "../../constants";
import "./OrdersPage.css";

// Past Orders page: lists orders from GET /orders. Each row links to that
// order's detail page (planning.md Section 2). The list endpoint returns orders
// without their items, so to show item image previews we fetch each order's
// detail (GET /orders/:id) and join the items' productId against the products
// list (passed from App). This is an intentional N+1 — fine for the small
// dataset, and there's no batch endpoint in the fixed API.
//
// An email can be typed to filter the list: GET /orders?email= matches exactly,
// case-insensitive, and an unmatched email returns an empty list (not an error).
function OrdersPage({ products = [] }) {
  const [orders, setOrders] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  // Per-order items, keyed by order id, for the image previews.
  const [orderItemsById, setOrderItemsById] = useState({});
  const [previewsLoading, setPreviewsLoading] = useState(false);
  // What the user has typed vs. what's actually applied to the query. The fetch
  // keys off appliedEmail so it only runs when the user submits, not per keystroke.
  const [emailInput, setEmailInput] = useState("");
  const [appliedEmail, setAppliedEmail] = useState("");

  // Fetch the order list whenever the applied email filter changes.
  useEffect(() => {
    let ignore = false;
    const fetchOrders = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const query = appliedEmail
          ? `?email=${encodeURIComponent(appliedEmail)}`
          : "";
        const { data } = await axios.get(`${API_BASE_URL}/orders${query}`);
        if (!ignore) setOrders(data);
      } catch (err) {
        if (!ignore) setError("Failed to load orders. Is the server running?");
      } finally {
        if (!ignore) setIsFetching(false);
      }
    };
    fetchOrders();
    return () => {
      ignore = true;
    };
  }, [appliedEmail]);

  // Once we have the order list, fetch each order's items for the previews.
  // allSettled so one bad order id doesn't blank every preview.
  useEffect(() => {
    let ignore = false;
    if (orders.length === 0) {
      setOrderItemsById({});
      return;
    }
    const fetchPreviews = async () => {
      setPreviewsLoading(true);
      const results = await Promise.allSettled(
        orders.map((o) => axios.get(`${API_BASE_URL}/orders/${o.id}`)),
      );
      if (ignore) return;
      const map = {};
      results.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          map[orders[idx].id] = result.value.data.orderItems || [];
        }
      });
      setOrderItemsById(map);
      setPreviewsLoading(false);
    };
    fetchPreviews();
    return () => {
      ignore = true;
    };
  }, [orders]);

  const handleFilter = (event) => {
    event.preventDefault();
    setAppliedEmail(emailInput.trim());
  };

  const handleShowAll = () => {
    setEmailInput("");
    setAppliedEmail("");
  };

  return (
    <div className="OrdersPage">
      <div className="content">
        <h1 className="title">Past Orders</h1>

        <form className="filter-bar" onSubmit={handleFilter}>
          <input
            className="filter-input"
            type="email"
            placeholder="Filter by email"
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <button className="filter-button" type="submit">
            Filter
          </button>
          {appliedEmail && (
            <button
              className="show-all-button"
              type="button"
              onClick={handleShowAll}
            >
              Show all
            </button>
          )}
        </form>

        {appliedEmail && !isFetching && !error && (
          <p className="filter-note">
            Showing orders for <strong>{appliedEmail}</strong>
          </p>
        )}

        {isFetching && <p className="notification">Loading orders...</p>}
        {error && <p className="notification error">{error}</p>}

        {!isFetching && !error && orders.length === 0 && (
          <p className="notification">
            {appliedEmail
              ? "No orders found for that email."
              : "No past orders yet."}
          </p>
        )}

        {!isFetching && !error && orders.length > 0 && (
          <div className="OrdersTable">
            <div className="header-row">
              <span>Order</span>
              <span className="order-items">Items</span>
              <span>Date</span>
              <span className="center">Status</span>
              <span className="right">Total</span>
            </div>
            {orders.map((order) => (
              <Link
                key={order.id}
                to={`/orders/${order.id}`}
                className="order-row"
              >
                <span className="order-id">Order #{order.id}</span>
                <span className="order-items">
                  <OrderItemPreview
                    orderItems={orderItemsById[order.id]}
                    products={products}
                    loading={previewsLoading && !orderItemsById[order.id]}
                  />
                </span>
                <span className="order-date">{formatDate(order.createdAt)}</span>
                <span className="center">
                  <span className="status">{order.status}</span>
                </span>
                <span className="right">{formatPrice(order.totalPrice)}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
