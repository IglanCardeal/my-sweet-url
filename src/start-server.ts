import monk from 'monk';

const PORT = process.env.PORT || 3000;
const DB_URL = String(process.env.DB_URI);

const db = monk(DB_URL);

export default (app: any): void => {
  db.then(() => {
    console.log(
      `\n*** Database connection successful.\n*** Database URI: ${DB_URL}`
    );

    app.listen(PORT, () => {
      console.log(
        `\nServer running on http://localhost:${PORT}\nENV: ${process.env.NODE_ENV}`
      );

      if (process.env.NODE_ENV === 'production') {
        console.log = () => {}; // para nao exibirmos nenhum log em producao
      }
    });
  }).catch((error) => {
    console.log(`\nUnable to start the server duo:\n`, error);
  });
};
