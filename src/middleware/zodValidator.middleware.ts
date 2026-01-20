import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { Logger } from "../libs/logger";
import { sendResponse } from "../libs/helper";

export const zodValidator =
  (schema: ZodSchema<any>) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await schema.safeParseAsync(req.body);

      if (!result.success) {
        const formattedErrors = result.error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        Logger.error("Zod Validation Error:", formattedErrors);

        sendResponse(
          res,
          411,
          false,
          "Input Validation Error",
          null,
          formattedErrors,
        );
        return;
      }

      // Replace body with validated & parsed data
      req.body = result.data;
      next();
    } catch (error) {
      Logger.error("Zod Validation Middleware Error:", error);
      sendResponse(res, 500, false, "Internal Server Error", null, error);
      return;
    }
  };
