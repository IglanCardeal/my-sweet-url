const checkProtocol = (url: string): string => {
  let urlWithProtocol;
  // por padrao, atribuo o http
  urlWithProtocol = url.match(/^((https?):\/\/)/) ? url : `http://${url}`;

  return urlWithProtocol;
};

export default checkProtocol;
