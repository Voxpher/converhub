export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, message: string, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request', code = 'BAD_REQUEST') {
    super(400, message, code);
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(404, message, 'NOT_FOUND');
  }
}
