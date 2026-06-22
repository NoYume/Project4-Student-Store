import "./StoreSubNavbar.css";

// The store-page toolbar, styled after the inventory dashboard screenshot: a
// "Product" heading, a working category filter dropdown, and a working search.
// The remaining controls (grid/list view toggle, gear, "ADD A PRODUCT") are
// demo-only — they're rendered for the look of a real store dashboard but have
// no behavior. Only the category dropdown and the search input actually filter.
const CATEGORIES = [
  "All Categories",
  "Accessories",
  "Apparel",
  "Books",
  "Snacks",
  "Supplies",
];

function StoreSubNavbar({
  activeCategory,
  setActiveCategory,
  searchInputValue,
  handleOnSearchInputChange,
}) {
  return (
    <div className="StoreSubNavbar">
      <div className="content">
        <div className="left">
          <h2 className="page-title">Products</h2>
          {/* Functional category filter. */}
          <div className="category-filter">
            <select
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              aria-label="Filter by category"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <i className="material-icons">expand_more</i>
          </div>
          {/* Functional search. */}
          <div className="search-bar">
            <i className="material-icons">search</i>
            <input
              type="text"
              name="search"
              placeholder="Search"
              value={searchInputValue}
              onChange={handleOnSearchInputChange}
            />
          </div>
        </div>

        {/* Demo-only controls — no behavior. */}
        <div className="right">
          <span className="view-toggle" title="Grid view (demo)">
            <i className="material-icons">grid_view</i>
          </span>
          <span className="view-toggle" title="List view (demo)">
            <i className="material-icons">view_list</i>
          </span>
          <span className="icon-button" title="Settings (demo)">
            <i className="material-icons">settings</i>
          </span>
          <button type="button" className="add-product" title="Demo only">
            ADD A PRODUCT
          </button>
        </div>
      </div>
    </div>
  );
}

export default StoreSubNavbar;
