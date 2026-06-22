import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { formatPrice, formatDate } from "../../utils/format";
import { getProductImage, FALLBACK_IMAGE } from "../../utils/productImage";
import { API_BASE_URL } from "../../constants";
import "./OrderDetail.css";

// Order Detail page: one order with its items, from GET /orders/:order_id
// (planning.md Section 2). The order's items carry productId but not a name, so
// we map productId -> name using the products list already fetched in App
// (passed as a prop), falling back to "Product #id" when not found.
function OrderDetail({ products = [] }) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
        setOrder(data);
      } catch (err) {
        setError("Order not found");
      } finally {
        setIsFetching(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (isFetching) {
    return (
      <div className="OrderDetail">
        <div className="content">
          <p className="notification">Loading order...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="OrderDetail">
        <div className="content">
          <p className="notification error">
            {error || "Order not found"}.
          </p>
          <Link to="/orders" className="back-link">
            &larr; Back to Past Orders
          </Link>
        </div>
      </div>
    );
  }

  const productById = products.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  return (
    <div className="OrderDetail">
      <div className="content">
        <Link to="/orders" className="back-link">
          &larr; Back to Past Orders
        </Link>

        <div className="order-card">
          <div className="order-header">
            <h1 className="order-title">Order #{order.id}</h1>
            <span className="status">{order.status}</span>
          </div>
          <p className="order-meta">
            Placed {formatDate(order.createdAt)} &middot; Customer #{order.customer}
          </p>

          <div className="ItemsTable">
            <div className="header-row">
              <span className="col-image" />
              <span className="col-name">Item</span>
              <span className="center">Quantity</span>
              <span className="center">Unit Price</span>
              <span className="right">Cost</span>
            </div>
            {order.orderItems.map((item) => {
              const product = productById[item.productId];
              const name = product?.name || `Product #${item.productId}`;
              return (
                <div key={item.id} className="item-row">
                  <span className="col-image">
                    <img
                      src={getProductImage(product)}
                      alt={name}
                      onError={(e) => {
                        e.currentTarget.src = FALLBACK_IMAGE;
                      }}
                    />
                  </span>
                  <span className="col-name">{name}</span>
                  <span className="center">{item.quantity}</span>
                  <span className="center">{formatPrice(item.price)}</span>
                  <span className="right">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="order-total">
            <span className="label">Total</span>
            <span className="amount">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        <Link to="/" className="shop-link">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}

export default OrderDetail;
