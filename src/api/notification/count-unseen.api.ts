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
 * /notifications/unseen/count:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notification
 *     summary: Get count of notifications.
 *     description: Get count of total notifications for specifed user.
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data: {
 *                 "countUnseenNotifications": 2
 *               }
 *       '400':
 *         description: Bad request, possibly incorrect ID
 *       '401':
 *         description: Not authenticated
 *       '404':
 *         description: Notification not found
 *       '500':
 *         description: Internal server error
 */
