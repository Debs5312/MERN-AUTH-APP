export const errorHandler = (statusCode, error) => {
  error.statusCode = statusCode;
  return error;
};
