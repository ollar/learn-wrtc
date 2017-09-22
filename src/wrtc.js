import { trace, _str } from './utils';

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

let peers = {};
let ws;
let UID;

let bindChannelEventsOnMessage = () => {};
let onSendChannelStateChangeHandler = () => {};

export function setPeers(_peers) {
  peers = _peers;
}

export function setWS(_ws) {
  ws = _ws;
}

export function setBindChannelEventsOnMessage(handler) {
  bindChannelEventsOnMessage = handler;
}

export function setOnSendChannelStateChangeHandler(handler) {
  onSendChannelStateChangeHandler = handler;
}

export function setUid(_uid) {
  UID = _uid;
}


export function createConnection(toUid) {
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

  channel.onmessage = bindChannelEventsOnMessage;
}

function _onSendChannelStateChange(channel) {
  trace('channel state changed: ' + channel.readyState);

  return onSendChannelStateChangeHandler(channel);
}

export function createChannel(toUid) {
  const peer = peers[toUid];
  const channel = peer.connection.createDataChannel(toUid, dataConstraint);

  trace('create channel: ' + toUid);

  peer.channel = channel;

  // bind channel events
  bindChannelEvents(channel);

  return channel;
}

export function createOffer(toUid) {
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

export function handleOffer(data) {
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

export function handleAnswer(data) {
  trace('handle answer from ' + data.fromUid);

  const answer = new RTCSessionDescription(JSON.parse(data.answer));
  const connection = peers[data.fromUid].connection;

  connection.setRemoteDescription(answer);
}

export function handleIceCandidate(data) {
  const connection = peers[data.fromUid].connection;
  connection.addIceCandidate(new RTCIceCandidate(JSON.parse(data.iceCandidate)));
}
