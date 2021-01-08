const psl = require('psl');

module.exports = {
  async up(db, client) {
    const NUMBER_OF_OBJECT = 20;

    const generatPublicUrlsObject = () => {
      const baseUrl = 'https://www.google.com';
      const date = new Date().toLocaleDateString('br');
      const parsedUlr = psl.parse(baseUrl.split('//')[1]).domain;

      const randomNumber = (min, max) => {
        return Math.floor(Math.random() * (max - min) + min);
      };

       // gerar letra aleatoria para teste de ordenacao
       const randomLetter = () => {
        const arr = 'WTeOrOdhuXPUdXPeuKjUjeMTgbhHdLkYA6qhVe6eL9UUzgtUizhQeasbuyhkdkakojf'.toLowerCase().split('');

        return arr[randomNumber(0, arr.length)];
      };

      let objArr = [];
      let i = 1;

      while (i <= NUMBER_OF_OBJECT) {
        const letter = randomLetter();

        objArr.push({
          alias: `${letter}_teste-${i}`,
          url: `${baseUrl}/teste-${i}`,
          publicStatus: true,
          createdAt: date,
          domain: parsedUlr,
          userId: null,
          number_access: randomNumber(0, 100) * 100
        });

        i++;
      }

      return objArr;
    };

    const publicUrlsObject = generatPublicUrlsObject();

    await db.collection('urls').insertMany(publicUrlsObject);
  },

  async down(db, client) {
    await db.dropDatabase('urls');
  },
};
