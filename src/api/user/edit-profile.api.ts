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
 * /users/profile:
 *   patch:
 *     security:
 *       - bearerAuth: []
 *     tags:
 *       - Profile
 *     summary: Edit profile info.
 *     description: Patch edit-profile data. Users can update their personal information and privacy settings.
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 description: User's first name
 *                 example: john
 *               last_name:
 *                 type: string
 *                 description: User's last name
 *                 example: Doe
 *               bio:
 *                 type: string
 *                 description: User's biography
 *                 example: I am John Doe. A fictional character.
 *               is_private:
 *                 type: boolean
 *                 description: Specifies privacy setting on user's profile
 *                 example: true
 *               email:
 *                 type: string
 *                 description: User's email address
 *                 example: john_doe@gmail.com
 *               password:
 *                 type: string
 *                 description: Password for the user
 *                 example: Pass1234
 *               confirmPassword:
 *                 type: string
 *                 description: Confirm password for the user
 *                 example: Pass1234
 *     responses:
 *       '200':
 *         description: A successful response
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               data: {
 *                 "id": "5bca304c-2e79-4045-b165-2b704fb2bbc4",
 *                 "first_name": null,
 *                 "last_name": null,
 *                 "avatar_url": null,
 *                 "email": "bbc@gs.com",
 *                 "username": "testy",
 *                 "password": "$2b$12$gT.wOkIEP.D136VQizs5qe3RHURc.4j0YmYNsR8L8Zu/DdxnlPiXi",
 *                 "bio": null,
 *                 "is_private": false,
 *                 "createdAt": "2024-08-13T13:19:51.772Z",
 *                 "updatedAt": "2024-08-13T13:20:11.000Z"
 *               }
 *       '400':
 *         description: Bad request, possibly incorrect data
 *       '401':
 *         description: Not authenticated
 *       '500':
 *         description: Internal server error
 */
