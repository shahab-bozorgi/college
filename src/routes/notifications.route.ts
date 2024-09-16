import { Router } from "express";
import { parseDtoWithSchema } from "../utilities/parse-dto-handler";
import { expressHandler } from "../utilities/handle-express";
import { NotificationService } from "../modules/action/notification/notification.service";
import { GetNotificationsSchema } from "../modules/action/notification/dto/get-notifications.dto";
import { SeenNotificationsSchema } from "../modules/action/notification/dto/seen-notifications.dto";
import { zodUserId } from "../modules/user/model/user-user-id";
import { countNotificationsByTypeSchema } from "../modules/action/notification/dto/count-notifications-by-type.dto";

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

  app.get("/unseen/count", async (req, res, next) => {
    const receiverId = parseDtoWithSchema(req.user.id, zodUserId);
    expressHandler(req, res, () => {
      return notificationService.countUnSeenNotifications(receiverId);
    });
  });

  app.get("/unseen/count/:notificationType", async (req, res, next) => {
    const dto = parseDtoWithSchema(
      {
        receiverId: req.user.id,
        notificationType: req.params.notificationType,
      },
      countNotificationsByTypeSchema
    );
    expressHandler(req, res, () => {
      return notificationService.countUnseenNotificationsByType(dto);
    });
  });

  return app;
};
