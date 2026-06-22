import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import axios from "axios";
import AppLayout from "../AppLayout/AppLayout";
import StorePage from "../StorePage/StorePage";
import ProductDetail from "../ProductDetail/ProductDetail";
import CartPage from "../CartPage/CartPage";
import OrdersPage from "../OrdersPage/OrdersPage";
import OrderDetail from "../OrderDetail/OrderDetail";
import SettingsPage from "../SettingsPage/SettingsPage";
import NotFound from "../NotFound/NotFound";
import {
  removeFromCart,
  addToCart,
  getQuantityOfItemInCart,
  getTotalItemsInCart,
} from "../../utils/cart";
import { formatPrice } from "../../utils/format";
import { API_BASE_URL } from "../../constants";
import "./App.css";

function App() {
  // State variables
  const [cartPreviewOpen, setCartPreviewOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState({});
  const [isFetching, setIsFetching] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState(null);

  // Load all products from the backend once, when the app first mounts.
  // GET /products returns a list of products (planning.md Section 2).
  useEffect(() => {
    const fetchProducts = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/products`);
        setProducts(data);
      } catch (err) {
        setError("Failed to load products. Is the server running?");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProducts();
  }, []);

  // Cart-preview controls.
  const closeCartPreview = () => setCartPreviewOpen(false);

  // Two add-to-cart variants over the same cart util:
  //  - handleOnAddToCart pops the preview sidebar (used on Store / ProductDetail).
  //  - handleOnAddToCartSilent does not (used by the Cart page's own controls,
  //    so editing quantities there doesn't re-pop the preview).
  const handleOnAddToCart = (item) => {
    setCart(addToCart(cart, item));
    setCartPreviewOpen(true);
  };
  const handleOnAddToCartSilent = (item) => setCart(addToCart(cart, item));
  const handleOnRemoveFromCart = (item) => setCart(removeFromCart(cart, item));
  const handleGetItemQuantity = (item) => getQuantityOfItemInCart(cart, item);

  const handleOnSearchInputChange = (event) => {
    setSearchInputValue(event.target.value);
  };

  // Place the order: POST /orders with the cart contents (planning.md Section 3).
  // The cart is stored as { productId: quantity }; the API wants an items array
  // of { productId, quantity }. The Student ID field becomes the integer
  // `customer`. The server prices each item and computes the total — we never
  // send a price or total. On success we build a receipt for CheckoutSuccess.
  const handleOnCheckout = async () => {
    const items = Object.keys(cart).map((productId) => ({
      productId: Number(productId),
      quantity: cart[productId],
    }));

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const customer = parseInt(userInfo.name, 10);
    if (Number.isNaN(customer)) {
      setError("Please enter a numeric Student ID before checking out.");
      return;
    }

    // Email is required and must look like an address: one @ with non-empty,
    // space-free parts on each side. A domain dot is NOT required, so both
    // "test@test.edu" and "user@email" are accepted.
    const email = (userInfo.email || "").trim();
    if (!/^[^\s@]+@[^\s@]+$/.test(email)) {
      setError("Please enter a valid email (e.g. user@codepath.com)");
      return;
    }

    setIsCheckingOut(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/orders`, {
        customer,
        email,
        items,
      });

      // Build a receipt from the created order. CheckoutSuccess reads
      // order.purchase.receipt.lines: line 0 is the header, the rest are items.
      const productById = products.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
      const lines = [
        `Order #${data.id} confirmed — thank you!`,
        ...data.orderItems.map((item) => {
          const name =
            productById[item.productId]?.name || `Product ${item.productId}`;
          return `${item.quantity} x ${name} @ ${formatPrice(item.price)}`;
        }),
        `Total: ${formatPrice(data.totalPrice)}`,
      ];
      setOrder({ ...data, purchase: { receipt: { lines } } });
      setCart({});
    } catch (err) {
      setError(
        err?.response?.data?.error ||
          "Failed to place order. Please try again.",
      );
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartCount = getTotalItemsInCart(cart);

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <AppLayout
                products={products}
                cart={cart}
                cartCount={cartCount}
                cartPreviewOpen={cartPreviewOpen}
                closeCartPreview={closeCartPreview}
              />
            }
          >
            {/* Default landing is the Store page. */}
            <Route path="/" element={<Navigate to="/store" replace />} />

            <Route
              path="/store"
              element={
                <StorePage
                  error={error}
                  products={products}
                  isFetching={isFetching}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  addToCart={handleOnAddToCart}
                  searchInputValue={searchInputValue}
                  handleOnSearchInputChange={handleOnSearchInputChange}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />

            <Route
              path="/products/:productId"
              element={
                <ProductDetail
                  addToCart={handleOnAddToCart}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />

            <Route
              path="/cart"
              element={
                <CartPage
                  products={products}
                  cart={cart}
                  addToCart={handleOnAddToCartSilent}
                  removeFromCart={handleOnRemoveFromCart}
                  userInfo={userInfo}
                  setUserInfo={setUserInfo}
                  handleOnCheckout={handleOnCheckout}
                  isCheckingOut={isCheckingOut}
                  error={error}
                  order={order}
                  setOrder={setOrder}
                />
              }
            />

            <Route
              path="/orders"
              element={<OrdersPage products={products} />}
            />
            <Route
              path="/orders/:orderId"
              element={<OrderDetail products={products} />}
            />

            <Route path="/settings" element={<SettingsPage />} />

            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
