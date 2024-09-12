// import { ActionNotificationRepository } from "../../../modules/common/repository/action-notification.repository";
// import { DataSource } from "typeorm";
// import { AppDataSource } from "../../../data-source";
// import { CreateActionDto } from "../../../modules/action/dto/create-action.dto";
// import { UserId } from "../../../modules/user/model/user-user-id";
// import { UUID } from "../../../data/uuid";
// import { ActionId } from "../../../modules/action/model/action-id";
// import { User } from "../../../modules/user/model/user.model";
// import { UserEntity } from "../../../modules/user/entity/user.entity";
// import { Username } from "../../../modules/user/model/user-username";
// import { Email } from "../../../data/email";
// import { v4 } from "uuid";

// describe("ActionNotificationRepository", () => {
//   let actionNotificationRepository: ActionNotificationRepository;
//   let dataSource: DataSource;
//   let actor: User;
//   let personalReceiver: User;
//   let friendReceiver_1: User;
//   let friendReceiver_2: User;

//   beforeEach(async () => {
//     dataSource = await AppDataSource.initialize();
//     actionNotificationRepository = new ActionNotificationRepository(dataSource);
//     const userRepo = dataSource.getRepository(UserEntity);
//     actor = {
//       id: v4() as UserId,
//       username: "actor" as Username,
//       email: "actor@gmail.com" as Email,
//       password: "User1234",
//     };

//     normalReceiver = {
//       id: v4() as UserId,
//       username: "normal" as Username,
//       email: "normal@gmail.com" as Email,
//       password: "User1234",
//     };

//     friendReceiver_1 = {
//       id: v4() as UserId,
//       username: "friend_1" as Username,
//       email: "friend_1@gmail.com" as Email,
//       password: "User1234",
//     };

//     friendReceiver_2 = {
//       id: v4() as UserId,
//       username: "friend_2" as Username,
//       email: "friend_2@gmail.com" as Email,
//       password: "User1234",
//     };
//     await userRepo.save([
//       actor,
//       normalReceiver,
//       friendReceiver_1,
//       friendReceiver_2,
//     ]);
//   });

//   it("should create an action and notifications", async () => {
//     const createActionDto: CreateActionDto = {
//       type: "comment",
//       actorId: actor.id,
//       entityId: "33a946b5-46fb-4e6f-946d-06aaeda8c769" as UUID,
//     };

//     const personalReceiverId: UserId = normalReceiver.id;
//     const friendReceiverIds: UserId[] = [
//       friendReceiver_1.id,
//       friendReceiver_2.id,
//     ];

//     const action = {
//       id: "01445b2f-fe29-448c-b474-f83a1ab6857e" as ActionId,
//       ...createActionDto,
//     };

//     // Call the method
//     const result =
//       await actionNotificationRepository.createActionWithNotifications(
//         createActionDto,
//         personalReceiverId,
//         friendReceiverIds
//       );

//     console.log(result);

//     // Check the result
//     expect(result).toBe(action);
//   });
// });
