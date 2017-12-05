import Template from '../templates/settings';

const SettingsView = Backbone.View.extend({
  template: Template,

  events: {
    'submit form': 'submit',
  },

  submit(e) {
    e.preventDefault();
    console.log(e)
  },

  render() {
    this.el.innerHTML = this.template(this.model);
    return this;
  }
});

export default SettingsView;
