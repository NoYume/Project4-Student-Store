const prisma = require("../src/db/db");

// Data-access methods for the Order model. These are thin wrappers over
// Prisma Client. Routes handle status codes and validation.
// get() includes each order's order items (Milestone 4).
class Order {
  static async list() {
    return prisma.order.findMany();
  }

  // Create an order and its items together, atomically (Milestone 5).
  // The caller validates the shape of `items`; this method prices each item
  // from the database product so the client cannot set its own prices.
  // If any productId is missing, it throws a PRODUCT_NOT_FOUND error and the
  // whole transaction rolls back, so no partial order is ever saved.
  static async create({ customer, status, items }) {
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
          totalPrice,
          orderItems: { create: orderItems },
        },
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
