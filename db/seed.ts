import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type * as schema from "./schema";
import { todos } from "./schema";

export function seed(db: BetterSQLite3Database<typeof schema>) {
  db.insert(todos)
    .values([
      { title: "Buy groceries", completed: 0 },
      { title: "Write tests", completed: 1 },
      { title: "Read a book", completed: 0 },
    ])
    .run();
}
