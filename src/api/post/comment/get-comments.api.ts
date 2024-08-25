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
 *       - Comment
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
 *               data: {
 *                  "comments": [
 *                      {
 *                          "id": "781d31da-5c67-406b-9dd4-996381a2bdc1",
 *                          "postId": "365028a0-4562-9dd4-8a62-3fdeb4801b1c",
 *                          "userId": "2a657f79-cb50-49d5-9aa5-eb4faf773b66",
 *                          "parentId": null,
 *                          "description": "This is a nice post",                
 *                          "createdAt": "2024-08-24T02:37:19.860Z",
 *                      },
 *                      {
 *                          "id": "adc5cadf-5c67-7d26-9dd4-996381a2bdc1",
 *                          "postId": "365028a0-4562-9dd4-8a62-3fdeb4801b1c",
 *                          "userId": "144028a0-ac7e-46c3-afcc-3379984c577f",
 *                          "parentId": "781d31da-5c67-406b-9dd4-996381a2bdc1",
 *                          "description": "Thanks",                
 *                          "createdAt": "2024-08-25T08:37:19.860Z",
 *                      }
 *                  ],
 *                  nextPage: "http://5.34.194.155:4000/posts/365028a0-4562-9dd4-8a62-3fdeb4801b1c/comments"  
 *               }
 *       '404':
 *         description: Post not found
 *       '500':
 *         description: Internal server error
 */
