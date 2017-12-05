import { _str } from '../utils';

import {
  setOnSendChannelStateChangeHandler,
  setBindChannelEventsOnMessage,
} from '../wrtc';

import TextMessage from './textMessage';
import Template from '../templates/main';

const MainView = Backbone.View.extend({
  events: {
    'submit form': 'onSubmit',
  },

  template: Template,

  initialize(options) {
    this.options = options || {};

    // set dom elements
    this.input = this.$('#data');
    this.usersList = this.$('#usersList');
    this.messagesList = this.$('#messagesList');
    this.button = this.$('#sendForm button');

    setBindChannelEventsOnMessage((e) => {
      this.appendMessage(JSON.parse(e.data).text);
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

  appendMessage(text, outgoing = false) {
    let textMessage = new TextMessage({ text, outgoing });

    this.messagesList[0].appendChild(textMessage.render().el);
  },

  onSubmit(e) {
    let peers = this.options.peers;
    e.preventDefault();
    peers.each(peer => {
      let channel = peer.get('channel');

      if (channel.readyState === 'open') {
        channel.send(_str({
          type: 'message',
          text: this.input[0].value,
        }));
      }
    });

    this.appendMessage(this.input[0].value, true);
    e.target.reset();
  },

  render() {
    this.el.innerHTML = this.template(this.model);

    return this;
  }
});

export default MainView;
