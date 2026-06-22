import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import logo from "../../assets/codepath.svg";
import person from "../../assets/person.svg";
import "./TopNavbar.css";

// Top navigation bar for the whole app. The CodePath logo sits at the left and
// links to the store. The center tabs are Home (intentionally inert — a demo
// tab with no destination), Store, Cart (with a live item-count badge), Orders,
// and Settings. The right-hand icons (bell, gear, profile picture) are
// demo-only and do nothing. On narrow screens the tabs collapse behind a
// hamburger toggle.
function TopNavbar({ cartCount = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="TopNavbar">
      <div className="content">
        <Link to="/store" className="brand" onClick={closeMenu}>
          <img src={logo} alt="CodePath" className="brand-logo" />
          <span className="brand-name">Student Store</span>
        </Link>

        <button
          className="hamburger"
          type="button"
          aria-label="Toggle navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i className="material-icons">{menuOpen ? "close" : "menu"}</i>
        </button>

        <nav className={`tabs ${menuOpen ? "open" : ""}`}>
          {/* Home is a demo-only tab: no destination, never navigates. */}
          <button type="button" className="tab inert">
            Home
          </button>
          <NavLink to="/store" className="tab" onClick={closeMenu}>
            Store
          </NavLink>
          <NavLink to="/cart" className="tab cart-tab" onClick={closeMenu}>
            Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </NavLink>
          <NavLink to="/orders" className="tab" onClick={closeMenu}>
            Orders
          </NavLink>
          <NavLink to="/settings" className="tab" onClick={closeMenu}>
            Settings
          </NavLink>
        </nav>

        {/* Demo-only icons — visual chrome with no behavior. */}
        <div className="actions">
          <span className="icon-button" title="Notifications">
            <i className="material-icons">notifications</i>
            <span className="dot" />
          </span>
          <span className="icon-button" title="Settings">
            <i className="material-icons">settings</i>
          </span>
          <span className="avatar" title="Profile">
            <img src={person} alt="Profile" />
          </span>
        </div>
      </div>
    </header>
  );
}

export default TopNavbar;
