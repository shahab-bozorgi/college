import { Router } from "express";
import { loginUserDto } from "../modules/user/dto/login-user.dto";
import { expressHandler } from "../utilities/handle-express";
import { UserService } from "../modules/user/user.service";
import { SignUpSchema } from "../modules/user/dto/create-user.dto";
import { PasswordResetService } from "../modules/password-reset/password-reset.service";
import { sendMail } from "../utilities/mail";
import { PasswordResetLinkSchema } from "../modules/password-reset/dto/password-reset-link.dto";
import { passwordResetSchema } from "../modules/password-reset/dto/password-reset.dto";
import { parseDtoWithSchema } from "../utilities/parse-dto-handler";

export const makeAuthRouter = (
  userService: UserService,
  passwordResetService: PasswordResetService
) => {
  const app = Router();

  app.post("/sign-up", (req, res) => {
    const dto = parseDtoWithSchema(req.body, SignUpSchema);
    expressHandler(req, res, () => userService.create(dto));
  });

  app.post("/login", (req, res) => {
    const dto = parseDtoWithSchema(req.body, loginUserDto);
    expressHandler(req, res, () => userService.login(dto));
  });

  app.post("/forgot-password", async (req, res) => {
    const dto = parseDtoWithSchema(req.body, PasswordResetLinkSchema);
    const user = await userService.getUserBy(dto.username);
    expressHandler(req, res, async () => {
      if (user) {
        const resetLink = await passwordResetService.createLink(user);
        await sendMail(
          [user.email],
          "Reset password link",
          resetLink,
          `<a href="${resetLink}">برای تنظیم مجدد رمز عبور روی این لینک کلیک کنید.</a>`
        );
      }
    });
  });

  app.post("/reset-password", async (req, res) => {
    const dto = parseDtoWithSchema(
      {
        ...req.body,
        token: req.query.token,
      },
      passwordResetSchema
    );
    expressHandler(req, res, () =>
      userService.passwordReset(dto, passwordResetService)
    );
  });

  return app;
};
