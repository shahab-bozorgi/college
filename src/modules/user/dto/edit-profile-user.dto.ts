import { z } from "zod";
import { Email, isEmail } from "../../../data/email";
import { isNoneEmptyString } from "../../../data/non-empty-string";
import { isPassword, Password } from "../model/user-password";
import { isUsername, Username } from "../model/user-username";
import { isSpecificLengthString } from "../../../data/specific-length-string";

export const EditProfileDto = z
  .object({
    first_name: z
      .string()
      .optional()
      .refine((value) => !value || isNoneEmptyString(value), {
        message: "نام را وارد کنید!",
      }),

    last_name: z
      .string()
      .optional()
      .refine((value) => !value || isNoneEmptyString(value), {
        message: "نام خانوادگی را وارد کنید!",
      }),

    avatar_url: z.string().url({ message: "url معتبر نیست!" }).optional(),

    email: z
      .string()
      .refine(isNoneEmptyString, {
        message: "ایمیل ویرایش لازمه!",
      })
      .refine((value) => isSpecificLengthString(value, 0, 255), {
        message: "طول ایمیل وارد شده نباید بیش از 255 کارکتر باشه!",
      })
      .refine(isEmail, {
        message: "ایمیل نادرست وارد شده!",
      })
      .transform((value: unknown) => value as Email),

    bio: z
      .string()
      .optional()
      .refine((value) => !value || isSpecificLengthString(value, 0, 160), {
        message: "بیوگرافی باید حداکثر 160 کاراکتر باشد!",
      }),

    is_private: z.boolean().optional(),

    password: z
      .string()
      .refine(isNoneEmptyString, {
        message: "رمز عبور ویرایش لازمه!",
      })
      .refine((value) => isSpecificLengthString(value, 8, 50), {
        message: "طول رمز عبور باید حداقل 8 و حداکثر 50 کارکتر باشه!",
      })
      .refine(isPassword, {
        message:
          "رمز عبور باید شامل حداقل یک حرف بزرگ و کوچک انگلیسی و یک رقم باشه!",
      })
      .transform((value: unknown) => value as Password),

    confirmPassword: z
      .string()
      .refine(isNoneEmptyString, {
        message: "لطفا تکرار رمز عبور رو وارد کن!",
      })
      .transform((value: unknown) => value as Password),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "تکرار رمز عبور با رمز عبور مطابقت نداره!",
  });

export type EditProfileDto = z.infer<typeof EditProfileDto>;
