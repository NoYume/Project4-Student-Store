import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import { getProductImage, FALLBACK_IMAGE } from "../../utils/productImage";
import "./CartPreview.css";

// A lightweight, read-only preview of the cart that slides in from the right
// whenever an item is added. It shows a short running list of what's in the
// cart — image, name, and unit price per line — but no quantity controls and
// no checkout. To see (and edit) the full cart, the user clicks "View Cart",
// which links to the /cart page. Dismissed with the X (onClose) or by opening
// the cart. The full detail/checkout lives on CartPage, not here.
function CartPreview({ products = [], cart = {}, isOpen, onClose }) {
  // Join the cart's { productId: quantity } against the products list so we can
  // show each item's image, name, and price. Skip ids we can't resolve.
  const productById = products.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const lines = Object.keys(cart)
    .map((productId) => {
      const product = productById[productId];
      if (!product) return null;
      return { ...product, quantity: cart[productId] };
    })
    .filter(Boolean);

  const totalItems = lines.reduce((acc, line) => acc + line.quantity, 0);

  return (
    <>
      {/* Click-away backdrop, only present while open. */}
      <div
        className={`CartPreview-backdrop ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      <aside className={`CartPreview ${isOpen ? "open" : "closed"}`}>
        <div className="preview-header">
          <h3>
            <i className="material-icons">shopping_cart</i>
            Cart {totalItems > 0 && <span className="count">({totalItems})</span>}
          </h3>
          <button
            type="button"
            className="close-button"
            aria-label="Close cart preview"
            onClick={onClose}
          >
            <i className="material-icons">close</i>
          </button>
        </div>

        <div className="preview-body">
          {lines.length === 0 ? (
            <p className="empty">Your cart is empty.</p>
          ) : (
            lines.map((line) => (
              <div key={line.id} className="preview-line">
                <div className="thumb">
                  <img
                    src={getProductImage(line)}
                    alt={line.name}
                    onError={(e) => {
                      e.currentTarget.src = FALLBACK_IMAGE;
                    }}
                  />
                </div>
                <div className="line-info">
                  <span className="line-name">{line.name}</span>
                  <span className="line-meta">
                    {line.quantity} &times; {formatPrice(line.price)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="preview-footer">
          <Link to="/cart" className="view-cart-button" onClick={onClose}>
            <i className="material-icons">shopping_cart</i>
            View Cart
          </Link>
        </div>
      </aside>
    </>
  );
}

export default CartPreview;
