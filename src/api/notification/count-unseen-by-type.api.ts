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
 * /notifications/unseen/count/{notificationType}:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notification
 *     summary: Get count of specefic notifications.
 *     description: Get count of friends or personal notifications for specifed user.
 *     parameters:
 *       - name: notificationType
 *         in: path
 *         schema:
 *           type: string
 *         required: true
 *         description: type of notification.
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data: {
 *                 "countUnseenNotifications": 1
 *               }
 *       '400':
 *         description: Bad request, possibly incorrect ID
 *       '401':
 *         description: Not authenticated
 *       '404':
 *         description: Notification not found
 *       '422':
 *           description: Field has an invalid or required value
 *           content:
 *            application/json:
 *               example:
 *                ok: true
 *                message: "Check validation key of this object!"
 *                validation: {
 *                      "notificationType": "invalid | required",
 *                }
 *       '500':
 *         description: Internal server error
 */
