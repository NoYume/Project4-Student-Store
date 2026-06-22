import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { formatPrice } from "../../utils/format";
import { getProductImage, FALLBACK_IMAGE } from "../../utils/productImage";
import "./ProductCard.css";

// A single product tile. Combines the inventory-dashboard card look (image,
// name, price, a 3-dots overflow menu) with the store's add/remove controls.
// The image and name link to the product detail page. The "+" and "-" icons
// add and remove from the cart, and the orange badge shows the current
// quantity. The 3-dots sits at the bottom-right (directly under the "-") and
// opens a small menu whose only item, "View details", links to the detail page.
function ProductCard({ product, quantity, addToCart, removeFromCart }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const detailPath = `/products/${product.id}`;

  // Close the overflow menu when clicking anywhere outside it.
  useEffect(() => {
    if (!menuOpen) return;
    const handleClickAway = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [menuOpen]);

  return (
    <div className="ProductCard">
      <div className="media">
        <Link to={detailPath}>
          <img
            src={getProductImage(product)}
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = FALLBACK_IMAGE;
            }}
          />
        </Link>
      </div>

      <div className="product-info">
        <div className="info">
          <Link to={detailPath} className="product-name">
            {product.name}
          </Link>
          <p className="product-price">{formatPrice(product.price)}</p>
        </div>

        <div className="actions">
          <div className="buttons">
            <i
              className="material-icons add"
              title="Add to cart"
              onClick={addToCart}
            >
              add
            </i>
            <i
              className="material-icons remove"
              title="Remove from cart"
              onClick={removeFromCart}
            >
              remove
            </i>
          </div>

          {/* 3-dots overflow menu, anchored bottom-right under the "-" icon. */}
          <div className="more" ref={menuRef}>
            <i
              className="material-icons"
              title="More"
              onClick={() => setMenuOpen((open) => !open)}
            >
              more_vert
            </i>
            {menuOpen && (
              <div className="more-menu">
                <Link to={detailPath} onClick={() => setMenuOpen(false)}>
                  View details
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {quantity ? (
        <span className="quantity-badge">{quantity}</span>
      ) : null}
    </div>
  );
}

export default ProductCard;
