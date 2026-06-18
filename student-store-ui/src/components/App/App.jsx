import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import axios from "axios";
import SubNavbar from "../SubNavbar/SubNavbar";
import Sidebar from "../Sidebar/Sidebar";
import Home from "../Home/Home";
import ProductDetail from "../ProductDetail/ProductDetail";
import NotFound from "../NotFound/NotFound";
import { removeFromCart, addToCart, getQuantityOfItemInCart, getTotalItemsInCart } from "../../utils/cart";
import { formatPrice } from "../../utils/format";
import { API_BASE_URL } from "../../constants";
import "./App.css";

function App() {

  // State variables
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchInputValue, setSearchInputValue] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", dorm_number: ""});
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

  // Toggles sidebar
  const toggleSidebar = () => setSidebarOpen((isOpen) => !isOpen);

  // Functions to change state (used for lifting state)
  const handleOnRemoveFromCart = (item) => setCart(removeFromCart(cart, item));
  const handleOnAddToCart = (item) => setCart(addToCart(cart, item));
  const handleGetItemQuantity = (item) => getQuantityOfItemInCart(cart, item);
  const handleGetTotalCartItems = () => getTotalItemsInCart(cart);

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

    setIsCheckingOut(true);
    setError(null);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/orders`, {
        customer,
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
          const name = productById[item.productId]?.name || `Product ${item.productId}`;
          return `${item.quantity} x ${name} @ ${formatPrice(item.price)}`;
        }),
        `Total: ${formatPrice(data.totalPrice)}`,
      ];
      setOrder({ ...data, purchase: { receipt: { lines } } });
      setCart({});
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to place order. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };


  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar
          cart={cart}
          error={error}
          userInfo={userInfo}
          setUserInfo={setUserInfo}
          isOpen={sidebarOpen}
          products={products}
          toggleSidebar={toggleSidebar}
          isCheckingOut={isCheckingOut}
          addToCart={handleOnAddToCart}
          removeFromCart={handleOnRemoveFromCart}
          getQuantityOfItemInCart={handleGetItemQuantity}
          getTotalItemsInCart={handleGetTotalCartItems}
          handleOnCheckout={handleOnCheckout}
          order={order}
          setOrder={setOrder}
        />
        <main>
          <SubNavbar
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            searchInputValue={searchInputValue}
            handleOnSearchInputChange={handleOnSearchInputChange}
          />
          <Routes>
            <Route
              path="/"
              element={
                <Home
                  error={error}
                  products={products}
                  isFetching={isFetching}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  addToCart={handleOnAddToCart}
                  searchInputValue={searchInputValue}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="/:productId"
              element={
                <ProductDetail
                  cart={cart}
                  error={error}
                  products={products}
                  addToCart={handleOnAddToCart}
                  removeFromCart={handleOnRemoveFromCart}
                  getQuantityOfItemInCart={handleGetItemQuantity}
                />
              }
            />
            <Route
              path="*"
              element={
                <NotFound
                  error={error}
                  products={products}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
              }
            />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  );
}

export default App;
 