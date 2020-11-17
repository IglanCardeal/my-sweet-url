import psl from 'psl';

const getDomain = (url: string) => {
  const urlWithNoProtocol =
    url.includes('http') || url.includes('https') ? url.split('//')[1] : url;
  const domain = psl.get(urlWithNoProtocol); // retorna dominio da url

  return domain;
};

export default getDomain;
