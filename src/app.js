// Crear baraja
const palos = ['♠', '♣', '♥', '♦'];
const valores = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let baraja = [];

palos.forEach(palo => {
  valores.forEach(valor => {
    baraja.push({
      valor: valor,
      palo: palo,
      color: (palo === '♥' || palo === '♦') ? 'red' : 'black',
      visible: false
    });
  });
});

baraja = baraja.sort(() => Math.random() - 0.5);

const columnas = [[], [], [], [], [], [], []];
const fundaciones = { '♠': [], '♣': [], '♥': [], '♦': [] };
let mazo = [...baraja];
let descarte = [];

// Repartir cartas
for (let i = 0; i < 7; i++) {
  for (let j = 0; j <= i; j++) {
    const carta = mazo.pop();
    carta.visible = (j === i);
    columnas[i].push(carta);
  }
}

let cartaSeleccionada = null;
let pilaSeleccionada = [];

function valorANumero(valor) {
  if (valor === 'A') return 1;
  if (valor === 'J') return 11;
  if (valor === 'Q') return 12;
  if (valor === 'K') return 13;
  return parseInt(valor);
}

function verificarVictoria() {
  const totalFundadas = Object.values(fundaciones).reduce((acc, pila) => acc + pila.length, 0);
  if (totalFundadas === 52) {
    setTimeout(() => alert('¡Felicidades! Has ganado el Solitario 🏆'), 100);
  }
}

function renderizarColumnas() {
  columnas.forEach((columna, index) => {
    const contenedor = document.getElementById(`columna-${index}`);
    contenedor.innerHTML = '';

    columna.forEach((carta, i) => {
      const div = document.createElement('div');
      let seleccionada = cartaSeleccionada && pilaSeleccionada.includes(carta);
      div.className = `card mb-2 ${carta.visible ? (carta.color === 'red' ? 'red' : 'black') : 'oculta'} ${seleccionada ? 'border border-primary border-3' : ''}`;
      div.dataset.columna = index;
      div.dataset.index = i;

      if (carta.visible) {
        div.innerHTML = `
          <div class="corner-top-left">${carta.palo}</div>
          <div class="card-value">${carta.valor}</div>
          <div class="corner-bottom-right">${carta.palo}</div>
        `;
      } else {
        div.style.backgroundImage = "url('8ada4173-570b-46a4-ac16-a04a96ba2a16.png')";
        div.style.backgroundSize = "cover";
        div.style.backgroundPosition = "center";
        div.style.backgroundRepeat = "no-repeat";
        div.innerHTML = '';
      }

      div.addEventListener('click', manejarClickCarta);
      contenedor.appendChild(div);
    });
  });

  const mazoContainer = document.getElementById('mazo');
  const descarteContainer = document.getElementById('descarte');

  mazoContainer.innerHTML = '';
  descarteContainer.innerHTML = '';

  if (mazo.length > 0) {
    const cartaTapada = document.createElement('div');
    cartaTapada.className = 'card oculta';
    cartaTapada.addEventListener('click', sacarCartaDelMazo);
    cartaTapada.style.backgroundImage = "url('8ada4173-570b-46a4-ac16-a04a96ba2a16.png')";
    cartaTapada.style.backgroundSize = "cover";
    cartaTapada.style.backgroundPosition = "center";
    cartaTapada.style.backgroundRepeat = "no-repeat";
    cartaTapada.innerHTML = '';
    mazoContainer.appendChild(cartaTapada);
  }

  if (descarte.length > 0) {
    const carta = descarte[descarte.length - 1];
    const div = document.createElement('div');
    div.className = `card ${carta.color === 'red' ? 'red' : 'black'}`;
    div.innerHTML = `
      <div class="corner-top-left">${carta.palo}</div>
      <div class="card-value">${carta.valor}</div>
      <div class="corner-bottom-right">${carta.palo}</div>
    `;
    div.addEventListener('click', () => {
      if (cartaSeleccionada === carta) {
        cartaSeleccionada = null;
        pilaSeleccionada = [];
      } else {
        cartaSeleccionada = carta;
        pilaSeleccionada = [carta];
      }
      renderizarColumnas();
    });
    descarteContainer.appendChild(div);
  }

  for (const palo in fundaciones) {
    const fundacionContainer = document.getElementById(`fundacion-${palo}`);
    fundacionContainer.innerHTML = '';
    const pila = fundaciones[palo];
    if (pila.length > 0) {
      const carta = pila[pila.length - 1];
      const div = document.createElement('div');
      div.className = `card ${carta.color === 'red' ? 'red' : 'black'}`;
      div.innerHTML = `
        <div class="corner-top-left">${carta.palo}</div>
        <div class="card-value">${carta.valor}</div>
        <div class="corner-bottom-right">${carta.palo}</div>
      `;
      div.addEventListener('click', () => manejarFundacionClick(palo));
      fundacionContainer.appendChild(div);
    } else {
      const empty = document.createElement('div');
      empty.className = 'card oculta';
      empty.innerHTML = palo;
      empty.addEventListener('click', () => manejarFundacionClick(palo));
      fundacionContainer.appendChild(empty);
    }
  }

  verificarVictoria();
}
}
function manejarFundacionClick(palo) {
  if (!cartaSeleccionada || pilaSeleccionada.length !== 1) return;
  const carta = cartaSeleccionada;
  if (carta.palo !== palo) return;

  const fundacion = fundaciones[palo];
  const valorEsperado = valorANumero(fundacion.length === 0 ? 'A' : fundacion[fundacion.length - 1].valor) + (fundacion.length === 0 ? 0 : 1);
  if (valorANumero(carta.valor) !== valorEsperado) return;

  let origen = columnas.find(col => col.includes(carta));
  if (!origen) origen = descarte;

  const idx = origen.indexOf(carta);
  if (idx > -1) origen.splice(idx, 1);
  fundacion.push(carta);

  cartaSeleccionada = null;
  pilaSeleccionada = [];
  renderizarColumnas();
}

function sacarCartaDelMazo() {
  if (mazo.length === 0) {
    mazo = descarte.reverse().map(c => ({ ...c, visible: false }));
    descarte = [];
  }

  const carta = mazo.pop();
  if (carta) {
    carta.visible = true;
    descarte.push(carta);
  }

  renderizarColumnas();
}

function manejarClickCarta(e) {
  const div = e.currentTarget;
  const colIndex = parseInt(div.dataset.columna);
  const cartaIndex = parseInt(div.dataset.index);

  const columna = columnas[colIndex];
  const carta = columna[cartaIndex];
  const esUltima = cartaIndex === columna.length - 1;

  if (!carta.visible && esUltima) {
    carta.visible = true;
    cartaSeleccionada = null;
    pilaSeleccionada = [];
    renderizarColumnas();
    prepararColumnasDestino();
    return;
  }

  if (carta.visible) {
    if (cartaSeleccionada && cartaSeleccionada !== carta) {
      const cartaDestino = carta;
      const colorDiferente = cartaDestino.color !== cartaSeleccionada.color;
      const valorCorrecto = valorANumero(pilaSeleccionada[0].valor) === valorANumero(cartaDestino.valor) - 1;

      if (colorDiferente && valorCorrecto) {
        let origen = columnas.find(col => col.includes(cartaSeleccionada));
        if (!origen) origen = descarte;

        const destino = columnas[colIndex];

        pilaSeleccionada.forEach(c => {
          const idx = origen.indexOf(c);
          if (idx > -1) origen.splice(idx, 1);
          destino.push(c);
        });

        cartaSeleccionada = null;
        pilaSeleccionada = [];
        renderizarColumnas();
        prepararColumnasDestino();
        return;
      }
    }

    const nuevaSeleccion = columna.slice(cartaIndex);
    if (cartaSeleccionada === carta) {
      cartaSeleccionada = null;
      pilaSeleccionada = [];
    } else {
      cartaSeleccionada = carta;
      pilaSeleccionada = nuevaSeleccion;
    }
    renderizarColumnas();
  }
}

function prepararColumnasDestino() {
  columnas.forEach((_, index) => {
    const contenedor = document.getElementById(`columna-${index}`);
    contenedor.onclick = function (e) {
      if (e.target === contenedor && cartaSeleccionada && columnas[index].length === 0) {
        if (pilaSeleccionada[0].valor === 'K') {
          let origen = columnas.find(col => col.includes(cartaSeleccionada));
          if (!origen) origen = descarte;

          pilaSeleccionada.forEach(c => {
            const idx = origen.indexOf(c);
            if (idx > -1) origen.splice(idx, 1);
            columnas[index].push(c);
          });

          cartaSeleccionada = null;
          pilaSeleccionada = [];
          renderizarColumnas();
        }
      }
    };
  });
}


renderizarColumnas();
prepararColumnasDestino();
