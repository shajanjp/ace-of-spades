var socket = io();
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

function playCard(card){
  socket.emit('ADD_TO_TABLE', { card: card} );
}

function updateTable(data){
  let tableContainer = $("#table-container");
  let cardsList = '';
  console.log('data', data);
  tableContainer.append(`<a class="grey card" data-card='${data.card.title}'>
    <div class="fluid image">
    <img src='./assets/img/${data.card.title}.jpg'>
    </div>
    <div class="extra">
    ${data.user.fullname}
    </div>
    </a>`);
}

function updateMyDetails(data){
  console.log('updateMyDetails', data);
  let myDetailsContainer = $('#my-details-container');
  myDetailsContainer.html(`<div class="ui fluid card">
    <div class="image">
    <img src="https://api.adorable.io/avatars/100/${data.id}.png">
    </div>
    <div class="content">
    <div class="header">${data.fullname}</div>
    </div>
    <div class="extra content">
    <div class="ui large transparent left icon input">
    <i class="edit outline icon"></i>
    <input type="text" placeholder="Update Name" value="${data.fullname}" id="fullname">
    </div>
    </div>
    </div>`)
}

function updateMyName(){
  let newName = $('#fullname').val();
  socket.emit('NAME_UPDATE', {fullname: newName})
}

function updateUsersList(data){
  let usersListContainer = $('#users-list');
  let usersData = '';
  Object.keys(data.users).forEach(user => {
    usersData += `<a class="item">${data.users[user].fullname}</a>`
  })
  usersListContainer.html(usersData);
  let usersCountContainer = $('#users-count').html(`${Object.keys(data.users).length}`);
}

function handleNewGame(data){
  console.log('handleNewGame data', data);
  let tableContainer = $("#table-container");
  tableContainer.html('');
  newCards(data);
}

function handleNewMessage(data){
  let chatContainer = $('#chat-container')
  chatContainer.append(`<div class="item">
    <b>${data.fullname}</b> : ${data.text} 
    </div>`);
}

function handleDiscard(){
  $('#table-container').html('');
}

socket.on('CARD_SHUFFLED', newCards);
socket.on('NEW_GAME', handleNewGame);
socket.on('TABLE_UPDATED', updateTable);
socket.on('MY_DETAILS', updateMyDetails);
socket.on('USERS_UPDATE', updateUsersList);
socket.on('NEW_CHAT', handleNewMessage);
socket.on('DISCARD', handleDiscard);


document.getElementById('new-game').onclick = () => {
  requestNewGame();
}

$('body').on('click', '.my-card', function(){
  playCard($(this).data('card'));
  $(this).remove();
});

$('body').on('focusout', '#fullname', function(){
  updateMyName();
});

$('#input-chat').keypress(function(e) {
  var dInput = $('#input-chat').val();
  if(e.which == 13) {
    socket.emit('NEW_CHAT', {text:dInput});
    $('#input-chat').val('');
  }
});

$('#discard-button').on('click', () => {
  socket.emit('DISCARD', {})
  $('#table-container').html('');
})

$('#take-button').on('click', () => {
  let cardsContainer = $("#cards-container .cards");
  $('#table-container .card').each((i, card) => {
    let curCard = $(card).data('card');
    cardsContainer.append(`<a class="grey card my-card" data-card='${curCard}'>
      <div class="fluid image">
      <img src='./assets/img/${curCard}.jpg'>
      </div>
      </a>`);
  })
  socket.emit('DISCARD', {});
})