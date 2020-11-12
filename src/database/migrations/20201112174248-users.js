module.exports = {
  async up(db, client) {
    const newUser = await db.collection('users').insert({
      username: "teste",
      email: "tete@email.com",
      password: "$2b$12$WTeOrOdhuXPUdXPeuKjUjeMTgbhHdLkYA6qhVe6eL9UUzgtUizhQe"
    });

    const userId = newUser.ops[0]._id.toString();
    console.log(userId);

    const NUMBER_OF_OBJECT = 20;

    const generatUsersUrlsObject = () => {
      const baseUrl = 'https://www.google.com';
      const date = new Date().toLocaleDateString('br');
      let objArr = [];
      let i = 1;

      while (i <= NUMBER_OF_OBJECT) {
        objArr.push({
          alias: `user_teste-${i}`,
          url: `${baseUrl}/teste-${i}`,
          publicStatus: false,
          date: date,
          userId: userId
        });

        i++;
      }

      return objArr;
    };

    const userUrlsObject = generatUsersUrlsObject();

    await db.collection('urls').insertMany(userUrlsObject);
  },

  async down(db, client) {
    await db.dropDatabase('users');
  }
};
