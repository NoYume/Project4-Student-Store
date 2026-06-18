const prisma = require("../src/db/db");

// Data-access methods for the OrderItem model. These are thin wrappers over
// Prisma Client. Routes handle status codes and validation.
// Milestone 4 needs creating and fetching order items. POST /orders uses
// create through a transaction in Milestone 5.
class OrderItem {
  static async list() {
    return prisma.orderItem.findMany();
  }

  static async get(id) {
    return prisma.orderItem.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.orderItem.create({ data });
  }
}

module.exports = OrderItem;
