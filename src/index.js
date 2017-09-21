import adapter from 'webrtc-adapter';
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
      console.log('hello new user')

      // create new webrtc connection
      createConnection(data.uid);
      // create channel
      createChannel(data.uid);
      // create offer ->
      createOffer(data.uid);
      break;

    case 'answer':
      console.log('here is answer')


      break;
  }
}

// =============================================================================

function receivedChannelCallback(e, toUid) {
  const channel = e.channel;
  const peer = peers[toUid];

  console.log(peer);
}

function receivedIceCandidate(e, toUid) {
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
    console.log('hooray message')
  }
}

function _onSendChannelStateChange(channel) {
  trace('chaqnnel state changed: ' + channel.readyState);
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
    return receivedIceCandidate(e, toUid);
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
