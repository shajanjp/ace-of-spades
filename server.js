var express = require('express');
var bodyParser = require('body-parser')
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', (req, res) => {
  res.json({status: true})
})

let allCards = ["S2", "S3", "S4", "S5", "S6", "S7", "S8", "S9", "S10", "SJ", "SQ", "SK", "SA", "H2", "H3", "H4", "H5", "H6", "H7", "H8", "H9", "H10", "HJ", "HQ", "HK", "HA", "D2", "D3", "D4", "D5", "D6", "D7", "D8", "D9", "D10", "DJ", "DQ", "DK", "DA", "C2", "C3", "C4", "C5", "C6", "C7", "C8", "C9", "C10", "CJ", "CQ", "CK", "CA"];

function generateRandomNumber(min, max){
  return Math.floor(Math.random() * (max-min) + min);
}

function shaffle(ordered){
  let newSet = ordered.slice();
  let ready = [];
  for(var i=newSet.length; i>0; i--){
    let r = generateRandomNumber(0, i);
    ready.push(newSet.splice(r, 1)[0])
  }
  return ready;
}

let shuffled = shaffle(allCards);

function reShuffleCards(client){
  shuffled = shaffle(allCards);
  client.emit('CARD_SHUFFLED', { cards: shuffled.slice(0,13) });
}

io.on('connection', client => {

  client.on('JOIN', data => { 
    console.log('data', data.username);
  });

  client.on('NEW_GAME', data => {
    console.log('request NEW_GAME');
    reShuffleCards(client);
  });
  
  client.emit('CARD_SHUFFLED', { cards: shuffled.slice(0,13) })

  client.on('disconnect', () => { 
    console.log('disconnected'); 
  });
});

http.listen(3000);