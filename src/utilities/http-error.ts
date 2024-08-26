type ErrorCode = 400 | 401 | 403 | 404 | 413 | 422 | 500;

export type FieldErrorLabel = "invalid" | "required" | "recordNotFound";

export type FieldValidationError = {
  [key: string]: FieldErrorLabel;
};

export class HttpError {
  constructor(
    public code: ErrorCode,
    public message: string | FieldValidationError
  ) {}
}

export class BadRequest extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class UnAuthorized extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

export class Forbidden extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFound extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class UserError extends HttpError {
  constructor(message: FieldValidationError) {
    super(422, message);
  }
}
