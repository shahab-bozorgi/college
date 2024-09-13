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
 * /notifications/seen:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Notification
 *     summary: Seen notifications.
 *     description: Seen notifications of authenticated user.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [notificationIds]
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 description: NotificationIds of authenticated user.
 *                 example: This should be ids of notifications.
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data: {
 *                 "seenNotificationsStatus": "true | false"
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
 *                      "notificationIds": "invalid | required",
 *                }
 *       '500':
 *         description: Internal server error
 */
