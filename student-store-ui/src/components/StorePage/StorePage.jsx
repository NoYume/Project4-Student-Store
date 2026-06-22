import StoreSubNavbar from "../StoreSubNavbar/StoreSubNavbar";
import ProductGrid from "../ProductGrid/ProductGrid";
import "./StorePage.css";

// The default landing page (mounted at /store). It renders the store toolbar
// (category filter + search) and the product grid. The category + search
// filtering logic is unchanged from the original Home component.
function StorePage({
  isFetching,
  error,
  products,
  addToCart,
  removeFromCart,
  searchInputValue,
  handleOnSearchInputChange,
  getQuantityOfItemInCart,
  activeCategory,
  setActiveCategory,
}) {
  // Filter by the active category unless it's "All Categories".
  const productsByCategory =
    Boolean(activeCategory) && activeCategory !== "All Categories"
      ? products.filter((p) => p.category === activeCategory)
      : products;

  // Then narrow by the search text (case-insensitive name match).
  const productsToShow = Boolean(searchInputValue)
    ? productsByCategory.filter(
        (p) =>
          p.name.toLowerCase().indexOf(searchInputValue.toLowerCase()) !== -1,
      )
    : productsByCategory;

  return (
    <div className="StorePage">
      <StoreSubNavbar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchInputValue={searchInputValue}
        handleOnSearchInputChange={handleOnSearchInputChange}
      />

      {error && <p className="store-error">{error}</p>}
      {isFetching && <p className="store-note">Loading products...</p>}

      {!isFetching && (
        <ProductGrid
          products={productsToShow}
          isFetching={isFetching}
          addToCart={addToCart}
          removeFromCart={removeFromCart}
          getQuantityOfItemInCart={getQuantityOfItemInCart}
        />
      )}
    </div>
  );
}

export default StorePage;
