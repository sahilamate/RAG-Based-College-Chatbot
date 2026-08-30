export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, extraFields = {}) => {
  const responsePayload = {
    success: true,
    message,
    ...extraFields
  };

  if (data !== null) {
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(extraFields).length === 0) {
      // Spread object properties if top level
      Object.assign(responsePayload, data);
    } else {
      responsePayload.data = data;
    }
  }

  return res.status(statusCode).json(responsePayload);
};

export const sendError = (res, statusCode = 500, message = 'Internal server error', errors = null) => {
  const responsePayload = {
    success: false,
    message
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  return res.status(statusCode).json(responsePayload);
};
