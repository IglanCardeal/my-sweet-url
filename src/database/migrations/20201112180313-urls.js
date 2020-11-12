module.exports = {
  async up(db, client) {
    const NUMBER_OF_OBJECT = 20;

    const generatPublicUrlsObject = () => {
      const baseUrl = 'https://www.google.com';
      const date = new Date().toLocaleDateString('br');
      let objArr = [];
      let i = 1;

      while (i <= NUMBER_OF_OBJECT) {
        objArr.push({
          alias: `teste-${i}`,
          url: `${baseUrl}/teste-${i}`,
          publicStatus: true,
          date: date,
          userId: null
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
