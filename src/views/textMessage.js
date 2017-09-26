const TextMessage = Backbone.View.extend({
  tagName: 'li',
  template: (data) => `${data.text}`,

  initialize(options) {
    this.options = options || {};
    if (this.options.outgoing) this.el.classList.add('outgoing');
  },

  render() {
    this.el.innerHTML = this.template({text: this.options.text});

    return this;
  }
});

export default TextMessage;