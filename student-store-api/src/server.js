const express = require("express");
const cors = require("cors");
const Product = require("../models/product");
const Order = require("../models/order");
const OrderItem = require("../models/orderItem");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World");
});

// GET /products — list all products (optional ?category= filter and ?sort= order)
app.get("/products", async (req, res) => {
  const { category, sort } = req.query;
  try {
    const products = await Product.list({ category, sort });
    res.status(200).json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// GET /products/:id — fetch one product by id
app.get("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  try {
    const product = await Product.get(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

// POST /products — add a new product
app.post("/products", async (req, res) => {
  const { name, description, price, imageUrl, category } = req.body;
  if (
    name === undefined ||
    description === undefined ||
    price === undefined ||
    imageUrl === undefined ||
    category === undefined
  ) {
    return res.status(400).json({ error: "Missing required product fields" });
  }
  try {
    const product = await Product.create({
      name,
      description,
      price,
      imageUrl,
      category,
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// PUT /products/:id — update an existing product
app.put("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  const { name, description, price, imageUrl, category } = req.body;
  const data = {};
  if (name !== undefined) data.name = name;
  if (description !== undefined) data.description = description;
  if (price !== undefined) data.price = price;
  if (imageUrl !== undefined) data.imageUrl = imageUrl;
  if (category !== undefined) data.category = category;
  try {
    const product = await Product.update(id, data);
    res.status(200).json(product);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to update product" });
  }
});

// DELETE /products/:id — remove a product (cascades to its order items)
app.delete("/products/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid product id" });
  }
  try {
    await Product.remove(id);
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to delete product" });
  }
});

// GET /orders — list all orders (optional ?email= filter, case-insensitive)
app.get("/orders", async (req, res) => {
  const { email } = req.query;
  try {
    const orders = await Order.list({ email });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// GET /orders/:order_id — fetch one order by id
// Note: order items are included starting in Milestone 4.
app.get("/orders/:order_id", async (req, res) => {
  const id = Number(req.params.order_id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  try {
    const order = await Order.get(id);
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// POST /orders — create an order and its items atomically (see planning.md Section 3)
app.post("/orders", async (req, res) => {
  const { customer, status, email, items } = req.body;

  // Validate the input before any database work.
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Order must include at least one item" });
  }
  if (customer === undefined) {
    return res.status(400).json({ error: "Order must include a customer" });
  }
  for (const item of items) {
    if (item.productId === undefined || !(item.quantity > 0)) {
      return res
        .status(400)
        .json({ error: "Each item needs a productId and a quantity above zero" });
    }
  }

  try {
    const order = await Order.create({ customer, status, email, items });
    res.status(201).json(order);
  } catch (err) {
    if (err.code === "PRODUCT_NOT_FOUND") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to create order" });
  }
});

// PUT /orders/:order_id — update an existing order (usually the status)
app.put("/orders/:order_id", async (req, res) => {
  const id = Number(req.params.order_id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  const { status, customer } = req.body;
  const data = {};
  if (status !== undefined) data.status = status;
  if (customer !== undefined) data.customer = customer;
  try {
    const order = await Order.update(id, data);
    res.status(200).json(order);
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(500).json({ error: "Failed to update order" });
  }
});

// DELETE /orders/:order_id — remove an order (cascades to its order items)
app.delete("/orders/:order_id", async (req, res) => {
  const id = Number(req.params.order_id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  try {
    await Order.remove(id);
    res.status(200).json({ message: "Order deleted" });
  } catch (err) {
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Order not found" });
    }
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// GET /order-items — list every order item (stretch endpoint)
app.get("/order-items", async (req, res) => {
  try {
    res.status(200).json(await OrderItem.list());
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch order items" });
  }
});

// POST /orders/:order_id/items — add one item to an existing order (stretch endpoint)
// The server prices the item from the product and recomputes the order total;
// Order.addItem runs it all in a transaction (see planning.md Section 2).
app.post("/orders/:order_id/items", async (req, res) => {
  const orderId = Number(req.params.order_id);
  if (Number.isNaN(orderId)) {
    return res.status(400).json({ error: "Invalid order id" });
  }
  const { productId, quantity } = req.body;
  if (productId === undefined || !(quantity > 0)) {
    return res
      .status(400)
      .json({ error: "An item needs a productId and a quantity above zero" });
  }
  try {
    const order = await Order.addItem(orderId, { productId, quantity });
    res.status(201).json(order);
  } catch (err) {
    if (err.code === "ORDER_NOT_FOUND") {
      return res.status(404).json({ error: "Order not found" });
    }
    if (err.code === "PRODUCT_NOT_FOUND") {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: "Failed to add order item" });
  }
});

// Render (and most hosts) assign the port via the PORT env var; fall back to
// 3000 for local development.
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
