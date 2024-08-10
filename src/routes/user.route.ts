import { Router } from "express";
import { UserService } from "../modules/user/user.service";
import { toUsername, Username } from "../modules/user/model/user-username";

export const makeUserRouter = (userService: UserService) => {
  const app = Router();
  app.get("/profile", (req, res) => {
    res.status(200).json({ ok: true, data: req.user });
  });

  /**
   * @swagger
   * /v1/user/{username}:
   *   get:
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
  app.get("/:username", async (req, res) => {
    const username: Username = toUsername(req.params.username);
    const user = await userService.findByUsername(username);
    res.status(200).send(user);
  });

  return app;
};
