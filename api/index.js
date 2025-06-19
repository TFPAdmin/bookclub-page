import { Hono } from "hono";
import booksRouter from "./routes/books";
import bookRelatedRouter from "./routes/book-related";
import { mockBooks } from "./lib/mockData.js";

const app = new Hono();

// Middleware to detect D1 availability and fallback to mock data
app.use("*", async (c, next) => {
  if (c.env.SQL) {
    // D1 database is bound and available
    c.env.DB_AVAILABLE = true;
  } else {
    // D1 not bound — fallback to mock data
    console.log("No D1 binding found. Using mock data.");
    c.env.DB_AVAILABLE = false;
    c.env.MOCK_DATA = mockBooks;
  }

  await next();
});

// API routes
app.route("/api/books", booksRouter);
app.route("/api/books/:id/related", bookRelatedRouter);

// Catch-all route for static assets
app.all("*", async (c) => {
  return c.env.ASSETS.fetch(c.req.raw);
});

// Export the fetch handler
export default {
  fetch: app.fetch,
};
