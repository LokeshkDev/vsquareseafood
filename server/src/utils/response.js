export const successResponse = (res, data, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data
  });
};

export const createdResponse = (res, data) => {
  return successResponse(res, data, 201);
};

export const paginatedResponse = (res, data, pagination) => {
  return res.status(200).json({
    success: true,
    data,
    pagination
  });
};

export const noContentResponse = (res) => {
  return res.status(204).send();
};
