const prisma = require("../src/db/db");

// Data-access methods for the Order model. These are thin wrappers over
// Prisma Client. Routes handle status codes and validation.
// get() includes each order's order items (Milestone 4).
class Order {
  // List orders, optionally filtered by email (Filter Orders feature). The
  // match is exact but case-insensitive, so "A@B.com" finds "a@b.com". With no
  // email, returns every order. Mirrors Product.list's query-param style.
  static async list({ email } = {}) {
    const args = {};
    if (email) {
      args.where = { email: { equals: email, mode: "insensitive" } };
    }
    return prisma.order.findMany(args);
  }

  // Create an order and its items together, atomically (Milestone 5).
  // The caller validates the shape of `items`; this method prices each item
  // from the database product so the client cannot set its own prices.
  // If any productId is missing, it throws a PRODUCT_NOT_FOUND error and the
  // whole transaction rolls back, so no partial order is ever saved.
  static async create({ customer, status, email, items }) {
    return prisma.$transaction(async (tx) => {
      // Fetch every referenced product at once.
      const productIds = items.map((item) => item.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
      });
      const priceById = new Map(products.map((p) => [p.id, p.price]));

      // Build the order items, pricing each from the product, and sum the total.
      let totalPrice = 0;
      const orderItems = items.map((item) => {
        const price = priceById.get(item.productId);
        if (price === undefined) {
          const err = new Error(`Product ${item.productId} does not exist`);
          err.code = "PRODUCT_NOT_FOUND";
          throw err;
        }
        totalPrice += price * item.quantity;
        return { productId: item.productId, quantity: item.quantity, price };
      });

      // One nested write saves the order and all its items together.
      return tx.order.create({
        data: {
          customer,
          status,
          email,
          totalPrice,
          orderItems: { create: orderItems },
        },
        include: { orderItems: true },
      });
    });
  }

  // Add one item to an existing order, atomically (stretch endpoint).
  // Mirrors create(): the price comes from the product, not the client, the
  // order total is recomputed on the server, and everything runs in one
  // transaction so a bad product never leaves a half-applied item or a wrong
  // total. Throws ORDER_NOT_FOUND or PRODUCT_NOT_FOUND for the route to map.
  static async addItem(orderId, { productId, quantity }) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) {
        const err = new Error("Order not found");
        err.code = "ORDER_NOT_FOUND";
        throw err;
      }

      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) {
        const err = new Error(`Product ${productId} does not exist`);
        err.code = "PRODUCT_NOT_FOUND";
        throw err;
      }

      await tx.orderItem.create({
        data: { orderId, productId, quantity, price: product.price },
      });
      await tx.order.update({
        where: { id: orderId },
        data: { totalPrice: order.totalPrice + product.price * quantity },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true },
      });
    });
  }

  static async get(id) {
    return prisma.order.findUnique({
      where: { id },
      include: { orderItems: true },
    });
  }

  static async update(id, data) {
    return prisma.order.update({ where: { id }, data });
  }

  static async remove(id) {
    return prisma.order.delete({ where: { id } });
  }
}

module.exports = Order;
