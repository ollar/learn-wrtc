import { uuid, _str } from './utils';
import {
  setPeers,
  setWS,
  setUid,

  createConnection,
  createChannel,
  createOffer,
  handleOffer,
  handleAnswer,
  handleIceCandidate,
  dropConnection,
} from './wrtc';
import MainView from './views/main';
import PeersCollection from './collections/peers';

const Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    ':roomId': 'enterRoom',
  },

  home() {
    Backbone.history.navigate(uuid(), true);
  },

  enterRoom(roomId) {
    // establist websocket connection
    const ws = new WebSocket('ws://0.0.0.0:8765');

    // set local variables
    const UID = uuid();
    const peers = new PeersCollection();

    // =============================================================================

    setPeers(peers);
    setWS(ws);
    setUid(UID);

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
          dropConnection(data.uid);
          break;
      }
    }

    return new MainView({
      ws,
      UID,
      peers,
      el: '#app',
    });
  }
});

export default Router;