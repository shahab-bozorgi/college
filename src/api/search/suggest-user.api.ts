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

 * /users/search/suggestion?query=jamesbond&count=2:
 *   get:
 *     summary: Get suggestions for a search query.
 *     description: Retrieves users ordered by followers count based on a search query.
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
 *                 {
 *                   "firstName": null,
 *                   "lastName": null,
 *                   "username": "Alireza",
 *                   "avatar": {
 *                     "id": "197421b6-a5ba-406f-99be-fe4560dcf698",
 *                     "name": "imageName_3.jpg",
 *                     "mime": "image/jpg",
 *                     "size": 1000000,
 *                     "path": "uploads/posts/imageName_3.jpg",
 *                     "url": "http://localhost:4000/uploads/posts/imageName_3.jpg"
 *                   },
 *                   "isCloseFriend": true
 *                 }, {
 *                   "firstName": null,
 *                   "lastName": null,
 *                   "username": "Alireza",
 *                   "avatar": {
 *                     "id": "197421b6-a5ba-406f-99be-fe4560dcf698",
 *                     "name": "imageName_3.jpg",
 *                     "mime": "image/jpg",
 *                     "size": 1000000,
 *                     "path": "uploads/posts/imageName_3.jpg",
 *                     "url": "http://localhost:4000/uploads/posts/imageName_3.jpg"
 *                   },
 *                   "isCloseFriend": true
 *                 }
 *               ]
 *       400:
 *         description: Bad request, possibly due to invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
