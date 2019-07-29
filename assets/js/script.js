var socket = io('http://localhost:3000');

function newCards(data){
  let cardsContainer = document.getElementById("cards-container");
  let cardsList = '';
  data.cards.forEach((card) => {
    cardsList += ` <a class="orange card">
    <div class="fluid image">
    <img src='./assets/img/${card}.jpg'>
    </div>
    </a>`;
  })
  cardsContainer.innerHTML = `<div class="ui eight cards">${cardsList}</div>`;
}

function requestNewGame(){
  socket.emit('NEW_GAME');  
}

socket.on('CARD_SHUFFLED', newCards);

socket.on('NEW_GAME', requestNewGame);

socket.emit('JOIN', { username: 'shajan'} );

document.getElementById('new-game').onclick = () => {
  requestNewGame();
}