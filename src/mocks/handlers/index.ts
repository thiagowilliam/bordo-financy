import { categoryHandlers } from "./categories";
import { expenseHandlers } from "./expenses";
import { tripHandlers } from "./trips";

export const handlers = [...tripHandlers, ...categoryHandlers, ...expenseHandlers];
