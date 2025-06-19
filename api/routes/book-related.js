import { Hono } from "hono";
import { selectDataSource, bookRelatedMockUtils } from "../lib/utils.js";

const bookRelatedRouter = new Hono();

bookRelatedRouter.get("/", async (c) => {
  const bookId = c.req.param("id");

  const mockLogic = async (c) => {
    return bookRelatedMockUtils.getRelatedBookData(c, bookId);
  };

  const dbLogic = async (c) => {
    const db = c.env.SQL;

    // Get the book
    const book = await db
      .prepare("SELECT * FROM books WHERE id = ?")
      .bind(bookId)
      .first();

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const bookGenre = book.genre;

    // Related books in the same genre
    const relatedBooksRes = await db
      .prepare("SELECT * FROM books WHERE genre = ? AND id != ? LIMIT 3")
      .bind(bookGenre, bookId)
      .all();

    // Genre counts
    const genreCountsRes = await db
      .prepare(`
        SELECT genre, COUNT(*) as count 
        FROM books 
        GROUP BY genre 
        ORDER BY count DESC
      `)
      .all();

    // Recent books excluding current one
    const recentBooksRes = await db
      .prepare(`
        SELECT * FROM books 
        WHERE id != ? 
        ORDER BY created_at DESC 
        LIMIT 2
      `)
      .bind(bookId)
      .all();

    return Response.json({
      bookId: bookId,
      bookGenre: bookGenre,
      relatedBooks: relatedBooksRes.results,
      recentRecommendations: recentBooksRes.results,
      genreStats: genreCountsRes.results,
      source: "database",
    });
  };

  return selectDataSource(c, dbLogic, mockLogic);
});

export default bookRelatedRouter;
