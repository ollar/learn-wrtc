import { _str } from '../utils';

import {
  setOnSendChannelStateChangeHandler,
  setBindChannelEventsOnMessage,
} from '../wrtc';

const MainView = Backbone.View.extend({
  initialize(options) {
    this.options = options || {};

    // set dom elements
    this.input = this.$('#data');
    this.messagesList = this.$('#messagesList');
    this.button = this.$('#sendForm button');

    setBindChannelEventsOnMessage((e) => {
      let li = document.createElement('li');
      li.innerHTML = JSON.parse(e.data).text;
      messagesList.appendChild(li);
    });

    setOnSendChannelStateChangeHandler(channel => {
      if (channel.readyState === 'open') {
        this.input[0].removeAttribute('disabled');
        this.button[0].removeAttribute('disabled');
      } else {
        this.input[0].setAttribute('disabled', true);
        this.button[0].setAttribute('disabled', true);
      }
    });
  },

  events: {
    'submit form': 'onSubmit',
  },

  onSubmit(e) {
    let peers = this.options.peers;
    e.preventDefault();
    Object.keys(peers).forEach(key => {
      let channel = peers[key].channel;

      if (channel.readyState === 'open') {
        channel.send(_str({
          type: 'message',
          text: this.input[0].value,
        }));
      }
    });

    let li = document.createElement('li');
    li.className = 'outgoing';
    li.innerHTML = this.input[0].value;
    messagesList.appendChild(li);
    e.target.reset();
  }
});

export default MainView;