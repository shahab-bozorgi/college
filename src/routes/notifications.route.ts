import { Router } from "express";
import { parseDtoWithSchema } from "../utilities/parse-dto-handler";
import { expressHandler } from "../utilities/handle-express";
import { NotificationService } from "../modules/action/notification/notification.service";
import { GetNotificationsSchema } from "../modules/action/notification/dto/get-notifications.dto";
import { array } from "zod";
import { zodNotificationId } from "../modules/action/notification/model/notification-id";
import { SeenNotificationsSchema } from "../modules/action/notification/dto/seen-notifications.dto";

export const makeNotificationRouter = (
  notificationService: NotificationService
) => {
  const app = Router();

  app.get("/friends", async (req, res, next) => {
    const dto = parseDtoWithSchema(
      {
        receiverId: req.user.id,
        notificationType: "friends",
        page: req.query.page,
        limit: req.query.limit,
      },
      GetNotificationsSchema
    );
    expressHandler(req, res, () => {
      return notificationService.getNotifications(dto);
    });
  });

  app.get("/personal", async (req, res, next) => {
    const dto = parseDtoWithSchema(
      {
        receiverId: req.user.id,
        notificationType: "personal",
        page: req.query.page,
        limit: req.query.limit,
      },
      GetNotificationsSchema
    );
    expressHandler(req, res, () => {
      return notificationService.getNotifications(dto);
    });
  });

  app.patch("/seen", async (req, res, next) => {
    const dto = parseDtoWithSchema(
      {
        notificationIds: req.body.notificationIds,
        receiverId: req.user.id,
      },
      SeenNotificationsSchema
    );
    expressHandler(req, res, () => {
      return notificationService.seenNotifications(dto);
    });
  });
  return app;
};
