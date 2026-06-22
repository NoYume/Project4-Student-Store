import { Link } from "react-router-dom";
import PaymentInfo from "../PaymentInfo/PaymentInfo";
import CheckoutSuccess from "../CheckoutSuccess/CheckoutSuccess";
import {
  calculateTaxesAndFees,
  calculateTotal,
} from "../../utils/calculations";
import { formatPrice } from "../../utils/format";
import { getProductImage, FALLBACK_IMAGE } from "../../utils/productImage";
import "./CartPage.css";

// The full cart page (mounted at /cart). It shows the complete cart — an image
// preview, name, quantity (with +/- controls), unit price, and line cost per
// item — plus subtotal, taxes, and total. Alongside it sits the checkout panel
// (PaymentInfo + CheckoutSuccess), reused as-is. The add/remove handlers passed
// here are the "silent" variants: editing quantities on this page must NOT pop
// the cart preview sidebar.
function CartPage({
  products = [],
  cart = {},
  addToCart,
  removeFromCart,
  userInfo,
  setUserInfo,
  handleOnCheckout,
  isCheckingOut,
  error,
  order,
  setOrder,
}) {
  // Resolve { productId: quantity } into rows joined with product data.
  const productById = products.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const rows = Object.keys(cart)
    .map((productId) => {
      const product = productById[productId];
      if (!product) return null;
      return {
        ...product,
        quantity: cart[productId],
        lineTotal: cart[productId] * product.price,
      };
    })
    .filter(Boolean);

  const subTotal = rows.reduce((acc, r) => acc + r.lineTotal, 0);
  const hasItems = rows.length > 0;
  // After a successful checkout the cart is cleared but `order` holds the
  // completed order. Show the receipt in that case, even though the cart is
  // now empty — otherwise the confirmation would be hidden by the empty state.
  const hasCompletedOrder = Boolean(order?.purchase);

  return (
    <div className="CartPage">
      <div className="content">
        <h1 className="page-title">Your Cart</h1>

        {hasCompletedOrder ? (
          <div className="checkout-result">
            <CheckoutSuccess
              userInfo={userInfo}
              order={order}
              setOrder={setOrder}
            />
          </div>
        ) : !hasItems ? (
          <div className="empty-cart">
            <i className="material-icons">remove_shopping_cart</i>
            <p>Your cart is empty.</p>
            <Link to="/store" className="shop-link">
              Browse the store
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Main column: the cart table */}
            <div className="cart-main">
              <div className="CartTable">
                <div className="header-row">
                  <span className="col-image" />
                  <span className="col-name">Name</span>
                  <span className="col-qty">Quantity</span>
                  <span className="col-price">Unit Price</span>
                  <span className="col-cost">Cost</span>
                </div>

                {rows.map((row) => (
                  <div key={row.id} className="product-row">
                    <span className="col-image">
                      <img
                        src={getProductImage(row)}
                        alt={row.name}
                        onError={(e) => {
                          e.currentTarget.src = FALLBACK_IMAGE;
                        }}
                      />
                    </span>
                    <span className="col-name">
                      <Link to={`/products/${row.id}`}>{row.name}</Link>
                    </span>
                    <span className="col-qty">
                      <span className="qty-control">
                        <button
                          type="button"
                          aria-label="Remove one"
                          onClick={() => removeFromCart(row)}
                        >
                          <i className="material-icons">remove</i>
                        </button>
                        <span className="qty-value">{row.quantity}</span>
                        <button
                          type="button"
                          aria-label="Add one"
                          onClick={() => addToCart(row)}
                        >
                          <i className="material-icons">add</i>
                        </button>
                      </span>
                    </span>
                    <span className="col-price">{formatPrice(row.price)}</span>
                    <span className="col-cost">
                      {formatPrice(row.lineTotal)}
                    </span>
                  </div>
                ))}

                <div className="receipt">
                  <div className="receipt-row">
                    <span className="label">Subtotal</span>
                    <span className="value">{formatPrice(subTotal)}</span>
                  </div>
                  <div className="receipt-row">
                    <span className="label">Taxes and Fees</span>
                    <span className="value">
                      {formatPrice(calculateTaxesAndFees(subTotal))}
                    </span>
                  </div>
                  <div className="receipt-row total">
                    <span className="label">Total</span>
                    <span className="value">
                      {formatPrice(calculateTotal(subTotal))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side column: checkout form (reused component, dark panel).
                The success receipt is shown separately above once the order
                completes. */}
            <div className="cart-checkout">
              <PaymentInfo
                userInfo={userInfo}
                setUserInfo={setUserInfo}
                handleOnCheckout={handleOnCheckout}
                isCheckingOut={isCheckingOut}
                error={error}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CartPage;
