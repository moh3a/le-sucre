// TODO aggregate from users + orders
// async list(page, limit) {
//     return db.select({
//       user_id: users.id,
//       name: users.name,
//       email: users.email,
//       total_orders: sql<number>`COUNT(${orders.id})`.mapWith(Number),
//       total_spent: sql<string>`COALESCE(SUM(CASE WHEN ${orders.payment_status}='paid' THEN ${orders.grand_total} ELSE 0 END), 0)`,
//       last_order_at: sql<string>`MAX(${orders.placed_at})`,
//     })
//     .from(users)
//     .leftJoin(orders, eq(orders.user_id, users.id))
//     .groupBy(users.id, users.name, users.email)
//     .orderBy(desc(sql`MAX(${orders.placed_at})`))
//     .limit(limit).offset(offset);
//   }
