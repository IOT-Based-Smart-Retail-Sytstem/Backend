// Enum for HTTP status codes
enum Code {
    OK = 200,
    Created = 201,
    Accepted = 202,
    NoContent = 204,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    Conflict = 409,
    InternalServerError = 500,
    NotImplemented = 501,
    ServiceUnavailable = 503,
}

// Enum for status messages
enum Status {
    SUCCESS = 'success',
    FAIL = 'fail',
    ERROR = 'error',
}

export { Code, Status };