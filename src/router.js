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
import SettingsView from './views/settings';
import PeersCollection from './collections/peers';
import { getMe } from './app';

const Router = Backbone.Router.extend({
  routes: {
    '': 'home',
    'settings': 'settings',
    'room/:roomId': 'enterRoom',
  },

  app: document.getElementById('app'),

  me: getMe(),

  execute(callback, args, name) {
    const user = window.localStorage.getItem('user');

    if (user) user = JSON.parse(user);

    if (name !== 'settings' && (!user || !user.name)) {
      return this._goToSettings();
    }

    return Backbone.Router.prototype.execute.apply(this, arguments);
  },

  _goToSettings() {
    Backbone.history.navigate('settings', true);
    return false;
  },

  _insertView(view) {
    if (this.app.childNodes.length) {
      return this.app.replaceChild(
        view,
        this.app.childNodes[0]
      );
    }

    return this.app.appendChild(view);
  },

  home() {
    return Backbone.history.navigate('room/' + uuid(), true);
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

    const mainView = new MainView({
      ws,
      UID,
      peers,
    });

    this._insertView(mainView.render().el);
  },

  settings() {
    const settingsView = new SettingsView();

    console.log(this.me)

    this._insertView(settingsView.render().el);
  },
});

export default Router;
