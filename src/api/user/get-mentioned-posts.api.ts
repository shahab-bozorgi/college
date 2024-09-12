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
 * /users/mentions?page=1&limit=10:
 *   get:
 *     summary: Get mentioned posts.
 *     description: Get posts where user is mentioned in.
 *     parameters:
 *       - name: page
 *         in: query
 *         description: page number.
 *         schema:
 *           type: string
 *       - name: limit
 *         in: query
 *         description: limit data for each page.
 *         schema:
 *           type: string
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Mentions
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             example:
 *               ok: true
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
 *                     "closeFriendsOnly": false
 *                   },
 *                   {
 *                     "id": "60615098-fb31-432d-aefc-e9c73d327bf2",
 *                     "createdAt": "2024-08-24T02:37:19.205Z",
 *                     "media": [],
 *                     "closeFriendsOnly": true
 *                   }
 *                 ],
 *                 "nextPage": 2,
 *                 "totalPages": 12
 *               }
 *       '400':
 *         description: Bad request, possibly incorrect data
 *       '401':
 *         description: Not authenticated
 *       '500':
 *         description: Internal server error
 */
