import { sql } from "drizzle-orm";
import { datetime, mysqlTable, text, varchar, int } from "drizzle-orm/mysql-core";
import { v4 as uuidv4 } from "uuid";


export const userTable = mysqlTable("users", {
    id: varchar("id", {length: 255}).primaryKey().$defaultFn(() => uuidv4()),
    first_name: varchar("first_name", {length: 255}).notNull(),
    last_name: varchar("last_name", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }).notNull().unique(),
    email: varchar("email", {length: 255}).unique().notNull(),
    password: varchar("password", { length: 255 }),
    created_at: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
})


export const tokenTable = mysqlTable("tokens", {
    id: varchar("id", {length: 255}).primaryKey(),
    expires_at: int("expires_at").notNull(),
    user_id: varchar("user_id", {length: 255}).notNull().references(() => userTable.id)
})


