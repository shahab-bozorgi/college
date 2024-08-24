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
 *
 * /posts?page=1&limit=2&username=someUser:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Post
 *     summary: Get posts.
 *     description: Get all posts of a specifed user..
 *     parameters:
 *       - name: page
 *         in: path
 *         description: page number.
 *         schema:
 *           type: integer
 *       - name: limit
 *         in: path
 *         description: page size.
 *         schema:
 *           type: integer
 *       - name: username
 *         in: path
 *         description: posts of username.
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data: {
 *                "id": "781d31da-5c67-406b-9dd4-996381a2bdc1",
 *                "authorId": "4e1b4e5d-662f-423e-a926-d8a48b632a99",
 *                "caption": "some caption",
 *                "media": [
 *                    {
 *                        "id": "11a69c2a-112b-439d-af2b-9243b23079da",
 *                        "name": "3a935f79-cb50-49d5-9aa5-eb4faf773b66.jpg",
 *                        "mime": "image/jpeg",
 *                        "size": 1842302,
 *                        "path": "uploads/posts/3a935f79-cb50-49d5-9aa5-eb4faf773b66.jpg"
 *                    },
 *                    {
 *                        "id": "adc5cadf-7d26-4562-8a62-3fdeb4801b1c",
 *                        "name": "144028a0-ac7e-46c3-afcc-3379984c577f.jpeg",
 *                        "mime": "image/jpeg",
 *                        "size": 9402,
 *                        "path": "uploads/posts/144028a0-ac7e-46c3-afcc-3379984c577f.jpeg"
 *                    }
 *                ],
 *                "createdAt": "2024-08-24T02:37:19.860Z",
 *               }
 *       '400':
 *         description: Bad request, possibly incorrect ID
 *       '401':
 *         description: Not authenticated
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Internal server error
 */
