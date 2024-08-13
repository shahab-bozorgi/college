/**
 * @swagger
 * /users/{username}:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user by Username.
 *     description: Get user by Username.
 *     parameters:
 *       - in: path
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: Username
 *     responses:
 *       '200':
 *         description: A successful response
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
