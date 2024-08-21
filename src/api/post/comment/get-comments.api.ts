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
 * /posts/{postId}/comments:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Post
 *     summary: Get comments.
 *     description: Get comments of post by PostId.
 *     parameters:
 *       - in: path
 *         name: postId
 *         schema:
 *           type: string
 *         required: true
 *         description: PostId
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data: []
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Internal server error
 */
