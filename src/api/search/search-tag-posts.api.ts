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

 * /posts/search?query=tag&page=2&limit=10:
 *   get:
 *     summary: Get full result of a search query.
 *     description: Retrieves posts ordered by likes count based on a search query on tags.
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
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *         required: true
 *         description: page number.
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *         required: true
 *         description: page size.
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of result.
 *         content:
 *           application/json:
 *             example:
 *               ok: true,
 *               data: {
 *                 "posts": [
 *                   {
 *                     "id": "2cf303ab-3095-43ce-a578-3c5b10fef519",
 *                     "createdAt": "2024-08-24T02:37:19.860Z",
 *                     "media": [
 *                       {
 *                         "id": "a99ce403-fbb2-4c3e-a8bb-66a615cc136f",
 *                         "name": "061ee257-1a2f-46c0-b152-b7381d678f7a.png",
 *                         "mime": "image/png",
 *                         "size": 111061,
 *                         "path": "http://localhost:4000/uploads/posts/061ee257-1a2f-46c0-b152-b7381d678f7a.png"
 *                       }
 *                     ],
 *                     "closeFriendsOnly": true,
 *                   },
 *                   {
 *                     "id": "60615098-fb31-432d-aefc-e9c73d327bf2",
 *                     "createdAt": "2024-08-24T02:37:19.205Z",
 *                     "media": [],
 *                     "closeFriendsOnly": true,
 *                   }
 *                 ],
 *                 "nextPage": 2,
 *                 "totalPages": 12
 *              }
 *       400:
 *         description: Bad request, possibly due to invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
