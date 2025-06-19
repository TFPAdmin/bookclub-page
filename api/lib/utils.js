/**
 * Selects appropriate data source based on database availability
 * @param {object} c - Hono context
 * @param {function} dbLogic - Function to execute when DB is available
 * @param {function} mockLogic - Function to execute when using mock data
 * @returns {Response} API response
 */
export async function selectDataSource(c, dbLogic, mockLogic) {
  try {
    // Use mock data if D1 SQL database binding is not available
    if (!c.env.SQL) {
      return await mockLogic(c);
    }

    // Use D1 database logic
    return await dbLogic(c);
  } catch (e) {
    console.error("API Error:", e);
    return Response.json(
      { error: e instanceof Error ? e.message : e },
      { status: 500 }
    );
  }
}

/**
 * Contains mock data logic functions for book-related endpoints
 */
export const bookRelatedMockUtils = {
  /**
   * Generates mock related books response
   * @param {object} c - Hono context
   * @param {string} bookId - Book ID to fetch related data for
   * @returns {Response} Mock API response
   */
  getRelatedBookData: async (c, bookId) => {
    const bookIdNum = parseInt(bookId, 10);
    const book = c.env.MOCK_DATA.find((book) => book.id === bookIdNum);

    if (!book) {
      return Response.json({ error: "Book not found" }, { status: 404 });
    }

    const bookGenre = book.genre;

    // Generate mock related data
    const relatedBooks
