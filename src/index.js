import { trace, uuid, _str } from './utils';
import {
  setPeers,
  setWS,
  setOnSendChannelStateChangeHandler,
  setBindChannelEventsOnMessage,
  setUid,

  createConnection,
  createChannel,
  createOffer,
  handleOffer,
  handleAnswer,
  handleIceCandidate } from './wrtc';

// establist websocket connection
const ws = new WebSocket('ws://0.0.0.0:8765');

// set local variables
const UID = uuid();
const peers = {};

// set dom elements
const form = document.getElementById('sendForm');
const input = document.getElementById('data');
const messagesList = document.getElementById('messagesList');
const button = document.querySelector('#sendForm button');

// add bindings
form.addEventListener('submit', (e) => {
  e.preventDefault();
  Object.keys(peers).forEach(key => {
    let channel = peers[key].channel;

    if (channel.readyState === 'open') {
      channel.send(_str({
        type: 'message',
        text: input.value,
      }));
    }
  });

  let li = document.createElement('li');
  li.className = 'outgoing';
  li.innerHTML = input.value;
  messagesList.appendChild(li);
  form.reset();
});


// =============================================================================

setPeers(peers);
setWS(ws);
setUid(UID);

setBindChannelEventsOnMessage((e) => {
  let li = document.createElement('li');
  li.innerHTML = JSON.parse(e.data).text;
  messagesList.appendChild(li);
});

setOnSendChannelStateChangeHandler(channel => {
  if (channel.readyState === 'open') {
    input.removeAttribute('disabled');
    button.removeAttribute('disabled');
  } else {
    input.setAttribute('disabled', true);
    button.setAttribute('disabled', true);
  }
});

ws.onopen = function(e) {
  ws.send(_str({
    type: 'enterRoom',
    uid: UID,
  }));
}

ws.onmessage = function(e) {
  const data = JSON.parse(e.data);

  switch (data.type) {
    case 'newUser':
      // create new webrtc connection
      createConnection(data.uid);
      // create channel
      createChannel(data.uid);
      // create offer ->
      createOffer(data.uid);
      break;

    case 'offerFrom':
      handleOffer(data);
      break;

    case 'answerFrom':
      handleAnswer(data);
      break;

    case 'iceCandidateFrom':
      handleIceCandidate(data);
      break;

    case 'channelClose':
      console.log('dropConnection');
      break;
  }
}

