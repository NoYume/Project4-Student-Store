import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import NotFound from "../NotFound/NotFound";
import { formatPrice } from "../../utils/format";
import { getProductImage, FALLBACK_IMAGE } from "../../utils/productImage";
import { API_BASE_URL } from "../../constants";
import "./ProductDetail.css";

function ProductDetail({ addToCart, removeFromCart, getQuantityOfItemInCart }) {

  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);

  // Fetch the single product when the route param changes.
  // GET /products/:id returns the product, or 404 if it doesn't exist
  // (planning.md Section 2) — a 404 falls through to the NotFound page.
  useEffect(() => {
    const fetchProduct = async () => {
      setIsFetching(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_BASE_URL}/products/${productId}`);
        setProduct(data);
      } catch (err) {
        setError("Product not found");
      } finally {
        setIsFetching(false);
      }
    };
    fetchProduct();
  }, [productId]);

  if (error) {
    return <NotFound />;
  }

  if (isFetching || !product) {
    return <h1>Loading...</h1>;
  }

  const quantity = getQuantityOfItemInCart(product);

  const handleAddToCart = () => {
    if (product.id) {
      addToCart(product)
    }
  };

  const handleRemoveFromCart = () => {
    if (product.id) {
      removeFromCart(product);
    }
  };

  return (
    <div className="ProductDetail">
      <div className="content">
        <Link to="/store" className="back-link">
          &larr; Back to Store
        </Link>
        <div className="product-card">
          <div className="media">
            <img
              src={getProductImage(product)}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>
          <div className="product-info">
            <span className="category-tag">{product.category}</span>
            <p className="product-name">{product.name}</p>
            <p className="product-price">{formatPrice(product.price)}</p>
            <p className="description">{product.description}</p>
            <div className="actions">
              <button onClick={handleAddToCart}>Add to Cart</button>
              {quantity > 0 && (
                <button className="secondary" onClick={handleRemoveFromCart}>
                  Remove from Cart
                </button>
              )}
              {quantity > 0 && (
                <span className="quantity">In cart: {quantity}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


export default ProductDetail;