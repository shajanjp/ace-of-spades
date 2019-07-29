var socket = io('http://localhost:3000');
let CARD_SET = ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "SJ", "SQ", "SK", "SA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "HJ", "HQ", "HK", "HA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "DJ", "DQ", "DK", "DA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "CJ", "CQ", "CK", "CA"];

function cardSort(a, b) {
  return (CARD_SET.indexOf(a) > CARD_SET.indexOf(b));
}

function newCards(data){
  let cardsContainer = document.getElementById("cards-container");
  let cardsList = '';
  data.cards.sort(cardSort).forEach((card) => {
    cardsList += ` <a class="grey card my-card" data-card='${card}'>
    <div class="fluid image">
    <img src='./assets/img/${card}.jpg'>
    </div>
    </a>`;
  })
  cardsContainer.innerHTML = `<div class="ui four cards">${cardsList}</div>`;
}

function requestNewGame(){
  socket.emit('NEW_GAME');
}

function requestJoinGame(){
  socket.emit('JOIN', { username: 'PlAYER1'} );
}

function addToTable(card){
  socket.emit('ADD_TO_TABLE', { card: card} );
}

function updateTable(data){
  let tableContainer = $("#table-container .cards");
  let cardsList = '';
  console.log('data', data);
  data.cards.forEach((card) => {
    cardsList += ` <a class="grey card" data-card='${card.title}'>
    <div class="fluid image">
    <img src='./assets/img/${card.title}.jpg'>
    </div>
    <div class="extra">
      ${card.owner}
    </div>
    </a>`;
  })
  tableContainer.html(tableContainer.html() + cardsList);
}

socket.on('CARD_SHUFFLED', newCards);
socket.on('NEW_GAME', requestNewGame);
socket.on('TABLE_UPDATED', updateTable);


document.getElementById('new-game').onclick = () => {
  requestNewGame();
}

$('body').on('click', '.my-card', function(){
  addToTable($(this).data('card'));
});

// document.getElementById('join-game').onclick = () => {
//   requestJoinGame();
// }