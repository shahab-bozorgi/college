/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * security:
 *   - bearerAuth: []

 * /posts/search/suggestion?query=tag&count=2:
 *   get:
 *     summary: Get suggestions for a search query.
 *     description: Retrieves tags ordered by posts count based on a search query.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Search
 *     parameters:
 *       - name: query
 *         in: query
 *         schema:
 *           type: string
 *         required: true
 *         description: query to search for.
 *       - name: count
 *         in: query
 *         schema:
 *           type: integer
 *         description: count of suggestions.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of suggestions.
 *         content:
 *           application/json:
 *             example:
 *               ok: true,
 *               data: [
 *                  "tag_1", "tag_2", "tag_3"
 *               ]
 *       400:
 *         description: Bad request, possibly due to invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
