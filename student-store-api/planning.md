# Student Store API - Planning

## Section 1: Data Models

### Product

An item for sale in the store. Fields:

- **id** (Int, column id): the primary key, auto-increments.
- **name** (String, column name): required.
- **description** (String, column description): required.
- **price** (Float, column price): required.
- **imageUrl** (String, column image_url): required.
- **category** (String, column category): required.
- **orderItems** (list of OrderItem): the link to its order items, not a stored column.

Notes:

- One product can be in many order items. The foreign key lives on the order item, not here.
- Price is a Float because the data has cents like 29.99. An Int would drop the cents.

### Order

One customer order. Fields:

- **id** (Int, column id): the primary key, auto-increments.
- **customer** (Int, column customer_id): required.
- **totalPrice** (Float, column total_price): required, defaults to 0.
- **status** (String, column status): required, defaults to pending.
- **createdAt** (DateTime, column created_at): required, defaults to the current time.
- **orderItems** (list of OrderItem): the link to its order items, not a stored column.

Notes:

- One order has many order items. The foreign key lives on the order item.
- The server sets totalPrice. It does not trust a total sent by the client.

### OrderItem

One line in an order: a product, how many, and the price paid. It links to both an Order and a Product. Fields:

- **id** (Int, column id): the primary key, auto-increments.
- **orderId** (Int, column order_id): foreign key to Order id.
- **productId** (Int, column product_id): foreign key to Product id.
- **quantity** (Int, column quantity): required.
- **price** (Float, column price): required.
- **order** (Order): the link back to its order, not a stored column.
- **product** (Product): the link back to its product, not a stored column.

Notes:

- Both foreign keys use cascade delete (onDelete Cascade): the order link points to Order id, and the product link points to Product id.
- We store price on the order item so old orders keep the price that was paid, even if the product's price changes later.

### Cascade rules

OrderItem is the child in both links, so deletes flow down into OrderItem:

1. Delete a Product, and every OrderItem that points to it is deleted. The orders stay.
2. Delete an Order, and every OrderItem in it is deleted. The products stay.

Both are set with cascade delete on OrderItem. Deleting an order item never deletes its order or product.

## Section 2: API Contract

### Error format

Every error response is an object with one field, error, holding a message about what went wrong.

Status codes:

- **200**: OK, used when a GET, PUT, or DELETE worked.
- **201**: Created, used when a POST worked.
- **400**: Bad request, used for missing or invalid input.
- **404**: Not found, used when there is no record with that id.
- **500**: Server error, used when something failed.

Notes:

- Success responses return the record as JSON, or a list for list endpoints.
- All ids in the URL are integers. A non-number id returns 400.
- The order total is always set by the server, never taken from the client.

### Product Endpoints

**GET /products** gets all products.

- Query params: category matches the exact category, like Apparel, and no value means all categories. Sort can be price or name, and no value means no sorting. Sorting is ascending.
- No params: return all products, no sorting.
- An unknown category returns 200 with an empty list. An unknown sort value is ignored and returns the list unordered, not an error.
- Success: 200 with a list of products, or an empty list if none.
- Error: 500 with the message Failed to fetch products.

**GET /products/:id** gets one product by id.

- Success: 200 with the product.
- Errors: 404 with Product not found, or 400 with Invalid product id.

**POST /products** adds a product.

- Body needs all five fields: name, description, price, imageUrl, and category.
- Success: 201 with the new product, which now has an id.
- Error: 400 with Missing required product fields.

**PUT /products/:id** updates a product.

- Body can have any of name, description, price, imageUrl, or category. Only the fields you send are changed.
- Success: 200 with the updated product.
- Error: 404 with Product not found.

**DELETE /products/:id** deletes a product. This also deletes its order items (cascade rule 1).

- Success: 200 with the message Product deleted.
- Error: 404 with Product not found.

### Order Endpoints

**GET /orders** gets all orders.

- Success: 200 with a list of orders.
- Error: 500 with Failed to fetch orders.

**GET /orders/:order_id** gets one order with its order items.

- Success: 200 with the order and its items. The order has its id, customer, totalPrice, status, createdAt, and an orderItems list, where each item has its id, orderId, productId, quantity, and price. This uses the Prisma include option on orderItems.
- Error: 404 with Order not found.

**POST /orders** creates an order with its items. See Section 3 for the full flow.

- Body has customer (required), status (optional, defaults to pending), and items (required, not empty), where each item has a productId and a quantity.
- The order total is not taken from the client.
- Success: 201 with the new order and its items, the same shape as GET /orders/:order_id.
- Errors: 400 with Order must include at least one item, or 400 with a message that the product id does not exist.

**PUT /orders/:order_id** updates an order, usually the status.

- Body can have any of status or customer.
- Success: 200 with the updated order.
- Error: 404 with Order not found.

**DELETE /orders/:order_id** deletes an order. This also deletes its order items (cascade rule 2).

- Success: 200 with the message Order deleted.
- Error: 404 with Order not found.

## Section 3: How POST /orders Works

This endpoint creates one order and its items together. If any step fails, nothing is saved.

### The request

The client sends customer, an optional status, and an items list. Each item has a productId and a quantity. The client says what to buy. The server figures out the price by reading each product's price from the database, so the client cannot change the price.

### The steps

1. Check the input first, before any database work. The items list must be there and not empty, or return 400 with Order must include at least one item. The customer must be there, or return 400. Each item needs a productId and a quantity above zero.
2. Start a transaction. Every query inside uses the transaction client so they all save or fail together.
3. Look up the products. Get the list of product ids and fetch them all at once. If any product id is missing, throw inside the transaction. The order rolls back and the handler returns 400 saying that product id does not exist. Nothing is saved.
4. Add up the total. For each item, take the product's price times the quantity and sum them. Save each product's price onto its order item.
5. Create the order and its items in one write, using a nested create so the order and all its items are saved together.
6. Return the new order with its items. The handler responds 201.

### What if something fails

The transaction runs everything as one database action. If anything inside throws, like a missing product or a database error, Prisma undoes all of it. The order and its items are removed together and the database is left how it was before. The handler turns the error into the right response:

- Unknown product id: 400 saying that product id does not exist.
- Empty or missing items: 400 (caught in step 1).
- Anything else: 500 with Failed to create order.

The point: the client either gets a full order back or gets an error, and a half finished order is never saved.

## Decisions Log

### Product Model (Milestone 1)

- **Went smoothly:** price as Float. The seed data has cents like 29.99, and Float keeps them. An Int would have dropped the cents.
- **Decision made during build:** used @map and @@map so the database keeps snake_case names (image_url, products table) while the code uses camelCase (imageUrl). This matches the seed file and the column names the frontend expects.
- **No spec change needed:** PUT /products/:id returns 200 with the updated product, just like the spec said. Tested and confirmed.

### Order Model (Milestone 3)

- **Built four of the five order routes:** GET list, GET by id, PUT, and DELETE. POST /orders was left for Milestone 5, since it needs the OrderItem model from Milestone 4 and the transaction work from Milestone 5. Building it now would mean writing code that gets thrown away.
- **GET /orders/:order_id returns the order without its items for now.** The spec says it should include the order items, but OrderItem does not exist until Milestone 4. The include option gets added then. This is the milestone order, not a missing feature.
- **The default values worked as planned.** totalPrice defaults to 0, status defaults to pending, and createdAt defaults to the current time. No spec change needed.

### Order Creation Transaction (Milestone 5)

- **What the spec got right:** the step order in Section 3 worked as written. Validate the input first, then fetch all the products at once, then price each item from the product and sum the total, then save the order and its items in one nested create. The total came out right in testing (29.99 times 2 plus 6.99 equals 66.97).
- **What the spec missed:** it did not say what status to save when the client leaves it out. The schema already defaults status to pending, so the route passes status straight through and undefined falls back to that default. No extra code needed, but it is worth noting since the spec only called status optional.
- **How the rollback works:** the whole create runs inside prisma.$transaction. Every query uses the transaction client, so they all commit together or not at all. If a product id is missing, the code throws, and Prisma undoes everything in that transaction. Tested with a payload that mixed a good product and a missing one: the response was 400 and no order was saved, so the good item did not leak in.
- **One thing to do differently:** the route does the field checks and the model does the pricing and the transaction. That split works, but if this grew I would move all the validation into one place so the route stays thin.

## Spec Reconciliation

### Milestone 4 (Schema Audit)

Schema vs spec gaps found:

- No real gaps. The OrderItem model in schema.prisma matches the OrderItem definition in Section 1: id, orderId (column order_id), productId (column product_id), quantity, price, both relations, and the order_items table name.
- One naming note: project-req.md calls the primary key order_item_id, but planning.md is the source of truth and names it id with column id. The schema follows planning.md, so the order item id is id, matching Product and Order. The same applies to the order id (id, not order_id) even though the route path uses :order_id.
- Both relationships use onDelete Cascade, set on the OrderItem side, which is where the spec says the cascade lives.

Cascade delete verification:

- Deleting a Product removes its OrderItems, and the order stays: tested. Deleted a product and the order item that pointed to it was gone while its order remained.
- Deleting an Order removes its OrderItems, and the products stay: tested. Deleted an order and its items were gone while every product remained.

### Final Audit

Filled in at Milestone 6.
