import { trace, uuid, _str } from './utils';

const pcConfig = {
  iceServers: [
    {urls:'stun:stun3.l.google.com:19302'},
    {
      urls: 'turn:192.158.29.39:3478?transport=udp',
      credential: 'JZEOEt2V3Qb0y27GRntt2u2PAYA=',
      username: '28224511:1379330808'
    },
  ]
};
const pcConstraints = null;
const dataConstraint = null;

const form = document.getElementById('sendForm');
const input = document.getElementById('data');
const messagesList = document.getElementById('messagesList');
const button = document.querySelector('#sendForm button');

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

const ws = new WebSocket('ws://0.0.0.0:8765');
const UID = uuid();
const peers = {};

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

// =============================================================================

function receivedChannelCallback(e, toUid) {
  const channel = e.channel;
  const peer = peers[toUid];

  peer.channel = channel;

  bindChannelEvents(channel);
}

function onIceCandidate(e, toUid) {
  if (e.candidate) {
    ws.send(_str({
      type: 'iceCandidate',
      fromUid: UID,
      toUid: toUid,
      iceCandidate: _str(e.candidate.toJSON()),
    }));
  }
}

function bindChannelEvents(channel) {
  channel.onopen = () => _onSendChannelStateChange(channel);
  channel.onclose = () => _onSendChannelStateChange(channel);

  channel.onmessage = (e) => {
    let li = document.createElement('li');
    li.innerHTML = JSON.parse(e.data).text;
    messagesList.appendChild(li);
  }
}

function _onSendChannelStateChange(channel) {
  trace('chaqnnel state changed: ' + channel.readyState);

  if (channel.readyState === 'open') {
    input.removeAttribute('disabled');
    button.removeAttribute('disabled');
  } else {
    input.setAttribute('disabled', true);
    button.setAttribute('disabled', true);
  }
}


// =============================================================================


function createConnection(toUid) {
  trace('new connection creating');
  const connection = new RTCPeerConnection(pcConfig, pcConstraints);

  connection.ondatachannel = function(e) {
    trace('receive datachannel event');
    return receivedChannelCallback(e, toUid);
  };

  connection.onicecandidate = function(e) {
    trace('received icecandidate');
    return onIceCandidate(e, toUid);
  };

  peers[toUid] = {
    connection,
  };

  return connection;
}

function createChannel(toUid) {
  const peer = peers[toUid];
  const channel = peer.connection.createDataChannel(toUid, dataConstraint);

  trace('create channel: ' + toUid);

  peer.channel = channel;

  // bind channel events
  bindChannelEvents(channel);

  return channel;
}

function createOffer(toUid) {
  const connection = peers[toUid].connection;

  connection.createOffer().then((offer) => {
    connection.setLocalDescription(offer);
    ws.send(_str({
      type: 'offer',
      fromUid: UID,
      toUid: toUid,
      offer: _str(offer),
    }));
  }).catch(e => console.log(e));
}

function handleOffer(data) {
  trace('handle offer from ' + data.fromUid);

  const offer = new RTCSessionDescription(JSON.parse(data.offer));
  const connection = createConnection(data.fromUid);

  connection.setRemoteDescription(offer);

  connection.createAnswer().then(answer => {
    connection.setLocalDescription(answer);
    ws.send(_str({
      type: 'answer',
      fromUid: UID,
      toUid: data.fromUid,
      answer: _str(answer),
    }));
  }).catch(e => console.log(e));
}

function handleAnswer(data) {
  trace('handle answer from ' + data.fromUid);

  const answer = new RTCSessionDescription(JSON.parse(data.answer));
  const connection = peers[data.fromUid].connection;

  connection.setRemoteDescription(answer);
}

function handleIceCandidate(data) {
  const connection = peers[data.fromUid].connection;
  connection.addIceCandidate(new RTCIceCandidate(JSON.parse(data.iceCandidate)));
}
