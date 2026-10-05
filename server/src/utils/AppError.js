export class AppError extends Error {
  constructor(message, statusCode, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, code = 'BAD_REQUEST') {
    return new AppError(msg, 400, code);
  }

  static unauthorized(msg, code = 'UNAUTHORIZED') {
    return new AppError(msg, 401, code);
  }

  static forbidden(msg, code = 'FORBIDDEN') {
    return new AppError(msg, 403, code);
  }

  static notFound(msg, code = 'NOT_FOUND') {
    return new AppError(msg, 404, code);
  }

  static conflict(msg, code = 'CONFLICT') {
    return new AppError(msg, 409, code);
  }

  static validationError(msg, code = 'VALIDATION_ERROR') {
    return new AppError(msg, 422, code);
  }

  static tooManyRequests(msg, code = 'TOO_MANY_REQUESTS') {
    return new AppError(msg, 429, code);
  }

  static internal(msg, code = 'INTERNAL_SERVER_ERROR') {
    return new AppError(msg, 500, code);
  }
}
