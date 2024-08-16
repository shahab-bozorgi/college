/**
 * @swagger
 * /{id}/profile:
 *   get:
 *     summary: Get user profile
 *     description: Retrieves the profile of a user based on their user ID.
 *     tags: [User]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: Successfully retrieved the user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 username:
 *                   type: string
 *                   example: "jack_hashemi"
 *                 first_name:
 *                   type: string
 *                   example: "jack"
 *                 bio:
 *                   type: string
 *                   example: "Full-stack developer"
 *                 avatar_url:
 *                   type: string
 *                   example: "https://example.com/avatar.jpg"
 *                 followingCount:
 *                   type: integer
 *                   example: 100
 *                 followersCount:
 *                   type: integer
 *                   example: 150
 *                 following:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["user1", "user2"]
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["user3", "user4"]
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User not found"
 *       500:
 *         description: Internal server error
 */
