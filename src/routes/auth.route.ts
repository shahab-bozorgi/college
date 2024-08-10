import { Router } from "express";
import { loginUserDto } from "../modules/user/dto/login-user.dto";
import { handleExpress } from "../utilities/handle-express";
import { UserService } from "../modules/user/user.service";
import { SignUpSchema } from "../modules/user/dto/create-user.dto";

export const makeAuthRouter = (userService: UserService) => {
  const app = Router();

  /**
   * @swagger
   * /v1/sign-up:
   *   post:
   *     summary: Sign-up user.
   *     description: Post sign-up data.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username of the user
   *                 example: johndoe
   *               email:
   *                 type: string
   *                 description: Email address of the user
   *                 example: johndoe@example.com
   *               password:
   *                 type: string
   *                 description: Password for the user
   *                 example: P@ssw0rd
   *               confirmPassword:
   *                 type: string
   *                 description: Confirm password for the user
   *                 example: P@ssw0rd
   *             required:
   *               - username
   *               - email
   *               - password
   *               - confirmPassword
   *     responses:
   *       '200':
   *         description: A successful response
   *       '400':
   *         description: Bad request, possibly missing or incorrect data
   *       '500':
   *         description: Internal server error
   */
  app.post("/sign-up", (req, res) => {
    const dto = SignUpSchema.parse(req.body);
    handleExpress(res, () => userService.create(dto));
  });

  /**
   * @swagger
   * /v1/login:
   *   post:
   *     summary: Login user.
   *     description: Post login data.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 description: Username of the user
   *                 example: johndoe
   *               password:
   *                 type: string
   *                 description: Password for the user
   *                 example: P@ssw0rd
   *             required:
   *               - username
   *               - password
   *     responses:
   *       '200':
   *         description: A successful response
   *       '400':
   *         description: Bad request, possibly missing or incorrect data
   *       '500':
   *         description: Internal server error
   */
  app.post("/login", (req, res) => {
    const dto = loginUserDto.parse(req.body);
    console.log("here");
    handleExpress(res, () => userService.login(dto));
  });

  return app;
};
