import { getProductImage, FALLBACK_IMAGE } from "../../utils/productImage";

// Renders a small row of item thumbnails for one order. Order items carry only
// a productId, so each image is resolved by joining against the products list.
// At most MAX thumbnails are shown; any remainder is summarized as "+N".
const MAX = 4;

function OrderItemPreview({ orderItems, products = [], loading }) {
  if (loading) {
    return <span className="preview-loading">Loading…</span>;
  }
  if (!orderItems || orderItems.length === 0) {
    return <span className="preview-empty">—</span>;
  }

  const productById = products.reduce((acc, p) => {
    acc[p.id] = p;
    return acc;
  }, {});

  const shown = orderItems.slice(0, MAX);
  const remaining = orderItems.length - shown.length;

  return (
    <div className="OrderItemPreview">
      {shown.map((item) => {
        const product = productById[item.productId];
        return (
          <div className="thumb" key={item.id} title={product?.name || ""}>
            <img
              src={getProductImage(product)}
              alt={product?.name || `Product #${item.productId}`}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMAGE;
              }}
            />
          </div>
        );
      })}
      {remaining > 0 && <span className="more-count">+{remaining}</span>}
    </div>
  );
}

export default OrderItemPreview;
