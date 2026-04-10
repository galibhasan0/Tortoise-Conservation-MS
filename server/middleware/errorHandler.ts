import { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  statusCode?: number;
  errors?: unknown;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error("[Error]", err.message, err.stack);

  const code = err.message?.includes("duplicate key") || err.message?.includes("unique")
    ? 409
    : err.message?.includes("foreign key") || err.message?.includes("violates")
    ? 409
    : err.statusCode ?? 500;

  return res.status(code).json({
    success: false,
    message: code === 500 ? "Internal server error" : err.message,
    errors: err.errors ?? undefined,
  });
}

export function createError(message: string, statusCode = 500, errors?: unknown) {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.errors = errors;
  return err;
}
