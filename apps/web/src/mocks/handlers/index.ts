import { authHandlers } from "./auth";
import { categoryHandlers } from "./categories";
import { expenseHandlers } from "./expenses";
import { photoHandlers } from "./photos";
import { profileHandlers } from "./profile";
import { tripHandlers } from "./trips";

export const handlers = [
  ...authHandlers,
  ...tripHandlers,
  ...categoryHandlers,
  ...expenseHandlers,
  ...photoHandlers,
  ...profileHandlers,
];
