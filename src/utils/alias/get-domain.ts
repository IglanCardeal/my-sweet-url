import psl from 'psl';

const getDomain = (url: string): string | null => {
  const urlWithNoProtocol =
    url.includes('http') || url.includes('https') ? url.split('//')[1] : url;

  const removedPaths = urlWithNoProtocol.includes('/')
    ? urlWithNoProtocol.split('/')[0]
    : urlWithNoProtocol;

  const domain = psl.get(removedPaths); // retorna dominio da url

  return domain;
};

export default getDomain;
