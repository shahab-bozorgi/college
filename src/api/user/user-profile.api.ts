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
 * /users/profile?username=someUser:
 *   get:
 *     summary: Retrieve user profile information
 *     description: Get the profile information of a user. JWT token should be provided in the Authorization header.
 *       if username is set profile info of the specified user will be returned.
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Profile
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: User ID
 *                 avatar:
 *                   type: string
 *                   description: URL of the user's avatar
 *                 username:
 *                   type: string
 *                   description: Username of the user
 *                 first_name:
 *                   type: string
 *                   description: User's first name
 *                 last_name:
 *                   type: string
 *                   description: User's last name
 *                 bio:
 *                   type: string
 *                   description: Bio of the user
 *                 followingCount:
 *                   type: integer
 *                   description: Number of users the profile is following
 *                 followersCount:
 *                   type: integer
 *                   description: Number of users following the profile
 *                 postsCount:
 *                   type: integer
 *                   description: Number of posts made by the user
 *                 followingStatus:
 *                   type: boolean
 *                   description: true if logged in user follows other user.
 *       '400':
 *         description: Bad request, possibly incorrect data
 *       '401':
 *         description: Not authenticated
 *       '500':
 *         description: Internal server error
 */
