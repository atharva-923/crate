// Wraps an async route handler so thrown errors reach the centralized
// error handler instead of crashing the process / hanging the request.
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

class ApiError extends Error {
  constructor(status, publicMessage) {
    super(publicMessage);
    this.status = status;
    this.publicMessage = publicMessage;
  }
}

module.exports = { asyncHandler, ApiError };
