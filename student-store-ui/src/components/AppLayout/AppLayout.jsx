import { Outlet } from "react-router-dom";
import TopNavbar from "../TopNavbar/TopNavbar";
import CartPreview from "../CartPreview/CartPreview";
import "./AppLayout.css";

// The site shell rendered once for every page (a react-router layout route).
// It holds the persistent top navigation and the slide-in cart preview, and
// renders the active page through <Outlet/>. All state is owned by App and
// passed down through here.
function AppLayout({
  products,
  cart,
  cartCount,
  cartPreviewOpen,
  closeCartPreview,
}) {
  return (
    <div className="AppLayout">
      <TopNavbar cartCount={cartCount} />
      <CartPreview
        products={products}
        cart={cart}
        isOpen={cartPreviewOpen}
        onClose={closeCartPreview}
      />
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default AppLayout;
