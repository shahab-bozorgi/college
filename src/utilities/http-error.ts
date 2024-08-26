type ErrorCode = 400 | 401 | 403 | 404 | 413 | 422 | 500;

export type FieldErrorLabel = "invalid" | "required" | "recordNotFound";

export type FieldValidationError = {
  [key: string]: FieldErrorLabel;
};

export class HttpError {
  constructor(
    public code: ErrorCode,
    public msg: string | FieldValidationError
  ) {}
}

export class BadRequest extends HttpError {
  constructor(msg: string) {
    super(400, msg);
  }
}

export class UnAuthorized extends HttpError {
  constructor(msg: string) {
    super(401, msg);
  }
}

export class Forbidden extends HttpError {
  constructor(msg: string) {
    super(403, msg);
  }
}

export class NotFound extends HttpError {
  constructor(msg: string) {
    super(404, msg);
  }
}

export class UserError extends HttpError {
  constructor(msg: FieldValidationError) {
    super(422, msg);
  }
}
