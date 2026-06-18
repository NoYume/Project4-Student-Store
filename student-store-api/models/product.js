const prisma = require("../src/db/db");

// Data-access methods for the Product model. These are thin wrappers over
// Prisma Client. Routes handle status codes and validation.
class Product {
  static async list({ category, sort } = {}) {
    const args = {};
    if (category) {
      args.where = { category };
    }
    if (sort === "price" || sort === "name") {
      args.orderBy = { [sort]: "asc" };
    }
    return prisma.product.findMany(args);
  }

  static async get(id) {
    return prisma.product.findUnique({ where: { id } });
  }

  static async create(data) {
    return prisma.product.create({ data });
  }

  static async update(id, data) {
    return prisma.product.update({ where: { id }, data });
  }

  static async remove(id) {
    return prisma.product.delete({ where: { id } });
  }
}

module.exports = Product;
