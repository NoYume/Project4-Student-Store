import codepath from "../assets/notebook.jpg";

// The CodePath logo — the brand image shown in the navbar, and the image we
// fall back to for products without a working image.
export const FALLBACK_IMAGE = codepath;

// Resolve which image to show for a product: its own imageUrl, falling back to
// the CodePath logo when one is missing.
export const getProductImage = (product) => {
  if (!product) return FALLBACK_IMAGE;
  return product.imageUrl || FALLBACK_IMAGE;
};
