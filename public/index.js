(() => {
  const button = document.querySelector('.form-button');

  button.addEventListener('click', (event) => {
    event.preventDefault();

    // favoritar();
  });

  // function favoritar() {
  //   // const salvarURL = document.URL;
  //   const salvarURL = document.querySelector('[name="url"]').value.trim();

  //   // vamos verificar se um ID ja existe
  //   let id = +localStorage.getItem('favId');

  //   // caso nao exista, entao assumimos que nao existe nada salvo
  //   if (!id) {
  //     id = 1; // valor inicial
  //     localStorage.setItem('favId', id); // salvamos o id no campo 'favId'
  //     localStorage.setItem(`favorito${id}`, salvarURL); // fica: favorito1

  //     return;
  //   }


  //   // o codigo seguinte server para verificar se a URL ja existe nos favoritos
  //   let urlExiste;

  //   for (let i = 1; i <= id; i++) {
  //     // se o favId for 5, vamos fazer um loop de 5 iteracoes e vamos comparar
  //     // cada uma das urls para verificar a igualdade

  //     const url = localStorage.getItem(`favorito${i}`); // favorito1, favorito2, favorito3...

  //     if (salvarURL === url) {
  //       urlExiste = true;
  //     }
  //   }

  //   // caso alguma url ja exista, alertamos ao usuario
  //   if (urlExiste) {
  //     window.alert('URL informada ja existe!');
  //     return;
  //   }

  //   // caso a url informada seja valida, salvamos ela e incrementamos o favId
  //   id = +id + 1;
  //   localStorage.setItem('favId', id);
  //   localStorage.setItem(`favorito${id}`, salvarURL);

  //   adicionaTituloFavoritos();

  //   function adicionaTituloFavoritos() {
  //     const favoritos = document.querySelector('.favoritos');

  //     favoritos.innerHTML = '';

  //     for (let i = 1; i <= id; i++) {
  //       const url = localStorage.getItem(`favorito${i}`);

  //       if (url) {
  //         const h2 = document.createElement('h2');
  //         h2.textContent = `favorito${i} - ${url}`;

  //         favoritos.appendChild(h2);
  //       }
  //     }
  //   }
}
}) ();
