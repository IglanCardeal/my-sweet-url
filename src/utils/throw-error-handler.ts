const throwErrorHandler = (
  statusCode: number = 500,
  message: string = 'Erro interno de servidor',
) => {
  const error = {
    statusCode: statusCode,
    message: message,
  };

  throw error;
};

export default throwErrorHandler;
