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
 * /posts/{postId}/comments/{commentId}/like:
 *   post:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Post
 *     summary: Create comment.
 *     description: Create new comments. users can create new comments.
 *     parameters:
 *       - in: path
 *         name: commentId
 *         schema:
 *           type: string
 *         required: true
 *         description: commentId
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data: {}
 *       '400':
 *         description: Bad request, possibly incorrect data
 *       '401':
 *         description: Not authenticated
 *       '500':
 *         description: Internal server error
 */
