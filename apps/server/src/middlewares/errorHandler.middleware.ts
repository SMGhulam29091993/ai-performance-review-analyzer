import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import * as jwt from "jsonwebtoken";

/**
 * Global error handler middleware for the application.
 * Handles various types of errors and returns appropriate responses.
 *
 * @param err - The error object
 * @param req - The request object
 * @param res - The response object
 * @param next - The next middleware function
 */
export const errorHandlerMiddleware: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let success = false;

  // Handle MongoDB duplicate key errors
  if (err.code === 11000) {
    const error = Object.keys(err.keyValue).map(
      (key) => `${key}: ${err.keyValue[key]}`
    );
    message = `Duplicate key error: ${error.join(", ")}`;
    statusCode = 400;
  }

  // Handle MongoDB invalid ObjectId errors
  if (err.name === "CastError") {
    message = `Invalid format: ${err.path}`;
    statusCode = 400;
  }

  // Handle JWT specific errors
  if (err instanceof jwt.TokenExpiredError) {
    message = "Token expired";
    statusCode = 401;
  } else if (err instanceof jwt.JsonWebTokenError) {
    message = "Invalid token";
    statusCode = 401;
  } else if (err.name === "UnauthorizedError") {
    message = err.message || "Unauthorized access";
    statusCode = 401;
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
    statusCode = 400;
  }

  // Prepare response object
  const responseObj = {
    success,
    message: process.env.NODE_ENV === "DEVELOPMENT" ? err.toString() : message,
    ...(process.env.NODE_ENV === "DEVELOPMENT" && { stack: err.stack }),
  };
  res.status(statusCode).json(responseObj);
  return;
};
