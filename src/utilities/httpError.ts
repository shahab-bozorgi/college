type ErrorCode = 400 | 401 | 403 | 404 | 500;

export class HttpError extends Error {
  constructor(public code: ErrorCode, public msg: string) {
    super(msg);
  }
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
