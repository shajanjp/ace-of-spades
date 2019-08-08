var socket = io();
let CARD_SET = ["SA","SK","SQ","SJ","S10","S9","S8","S7","S6","S5","S4","S3","S2","DA","DK","DQ","DJ","D10","D9","D8","D7","D6","D5","D4","D3","D2","CA","CK","CQ","CJ","C10","C9","C8","C7","C6","C5","C4","C3","C2","HA","HK","HQ","HJ","H10","H9","H8","H7","H6","H5","H4","H3","H2"];
let usernameLastSet = localStorage.getItem('username')

function cardSort(a, b) {
  return (CARD_SET.indexOf(a) - CARD_SET.indexOf(b));
}

function newCards(data){
  let cardsContainer = document.getElementById("cards-container");
  let cardsList = '';
  data.cards.sort(cardSort).forEach((card) => {
    cardsList += ` <a class="grey card my-card" data-card='${card}'>
    <div class="fluid image">
    <img src='./assets/img/${card}.svg'>
    </div>
    </a>`;
  })
  cardsContainer.innerHTML = `<div class="ui four cards">${cardsList}</div>`;
}

function requestNewGame(){
  socket.emit('SHUFFLE_CARDS');
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
  tableContainer.append(`<a class="${data.user.color} card" 
    data-card='${data.card.title}' 
    data-card-owner='${data.user.id}'>
    <div class="fluid image">
    <img src='./assets/img/${data.card.title}.svg'>
    </div>
    <div class="extra">
    ${data.user.fullname}
    </div>
    <div class="extra content">
    <span>
    <i class="undo icon"></i>
    </span>
    </div>
    </a>`);
}

function updateMyDetails(data){
  console.log('updateMyDetails', data);
  let myDetailsContainer = $('#my-details-container');
  myDetailsContainer.html(`
    <div class="ui fluid list">
    <div class="item">
    <img class="ui avatar image" src="https://api.adorable.io/avatars/50/${data.fullname}.svg">
    <div class="content">
    <a class="header" contentEd>${data.fullname}</a>
    <div class="description">${data.ip}</div>
    </div>
    </div>
    </div>
    <div class="ui large transparent left icon input">
    <i class="edit outline icon"></i>
    <input type="text" placeholder="Update Name" value="${data.fullname}" id="fullname">
    </div>
    `)
}

function updateMyName(){
  let newName = $('#fullname').val();
  localStorage.setItem('username', newName);
  socket.emit('NAME_UPDATE', {fullname: newName})
}

function updateUsersList(data){
  let usersListContainer = $('#users-list');
  let usersData = '';
  Object.keys(data.users).forEach(user => {
    usersData += `
      <a class="item">
        <div class="ui ${data.users[user].color} empty circular label"></div>
        ${data.users[user].fullname}
      </a>`
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
  chatContainer.prepend(`<div class="comment">
    <a class="avatar">
      <img src="https://api.adorable.io/avatars/50/${data.user.id}.svg">
    </a>
    <div class="content">
      <a class="author">${data.user.fullname}</a>
      <div class="text">
       ${data.text}
      </div>
    </div>
  </div>`);
}

function handleDiscard(){
  $('#table-container').html('');
}

function handleConnected(){
  console.log('connected to server');
  if(usernameLastSet && usernameLastSet !== ''){
    socket.emit('NAME_UPDATE', { fullname: usernameLastSet })
  }
}

socket.on('CARD_SHUFFLED', newCards);
socket.on('SHUFFLE_CARDS', handleNewGame);
socket.on('TABLE_UPDATED', updateTable);
socket.on('MY_DETAILS', updateMyDetails);
socket.on('USERS_UPDATE', updateUsersList);
socket.on('NEW_CHAT', handleNewMessage);
socket.on('DISCARD', handleDiscard);
socket.on('connect', handleConnected)


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
      <img src='./assets/img/${curCard}.svg'>
      </div>
      </a>`);
  })
  socket.emit('TAKE_ALL', {});
})

