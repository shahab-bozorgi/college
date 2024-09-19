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

 * /users/search?query=jamesbond&page=2&limit=10:
 *   get:
 *     summary: Get full result of a search query.
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
 *                "users": [
 *                  {
 *                    "id": "9aacfc90-4de9-4148-bbca-6bd682d67a56",
 *                    "firstName": null,
 *                    "lastName": null,
 *                    "username": "Alireza",
 *                    "avatar": {
 *                      "id": "197421b6-a5ba-406f-99be-fe4560dcf698",
 *                      "name": "imageName_3.jpg",
 *                      "mime": "image/jpg",
 *                      "size": 1000000,
 *                      "path": "uploads/posts/imageName_3.jpg",
 *                      "url": "http://localhost:4000/uploads/posts/imageName_3.jpg"
 *                    },
 *                    "followersCount": 1,
 *                    "followingStatus": Following,
 *                    "isCloseFriend": true,
 *                  }, {
 *                    "id": "9aacfc90-4de9-4148-bbca-6bd682d67a56",
 *                    "firstName": null,
 *                    "lastName": null,
 *                    "username": "Alireza",
 *                    "avatar": {
 *                      "id": "197421b6-a5ba-406f-99be-fe4560dcf698",
 *                      "name": "imageName_3.jpg",
 *                      "mime": "image/jpg",
 *                      "size": 1000000,
 *                      "path": "uploads/posts/imageName_3.jpg",
 *                      "url": "http://localhost:4000/uploads/posts/imageName_3.jpg"
 *                    },
 *                    "followersCount": 1,
 *                    "followingStatus": Following,
 *                    "isCloseFriend": true,
 *                  }
 *                ],
 *                "nextPage": null,
 *                "totalPages": 1
 *              }
 *       400:
 *         description: Bad request, possibly due to invalid user ID
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */
