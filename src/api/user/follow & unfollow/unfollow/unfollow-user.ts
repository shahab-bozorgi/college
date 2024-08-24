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
 * users/unfollow/{followingId}:
 *   delete:
 *     summary: Unfollow a user
 *     description: Allows a user to unfollow another user by their ID.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Following
 *     parameters:
 *       - in: path
 *         name: followingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to unfollow.
 *     responses:
 *       200:
 *         description: Successfully unfollowed the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   description: An empty object indicating success
 *       400:
 *         description: Bad request, possibly due to invalid user ID or attempt to unfollow a user who was not followed
 *       401:
 *         description: Unauthorized, user must be authenticated
 *       404:
 *         description: User not found or follow relationship not found
 *       500:
 *         description: Internal server error
 */
