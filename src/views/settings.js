import Template from '../templates/settings';
import serialize from '../utils/serialize-form';

const SettingsView = Backbone.View.extend({
  template: Template,

  events: {
    'submit form': 'submit',
  },

  submit(e) {
    e.preventDefault();
    console.log(e)

    console.log(serialize(e.target))
  },

  render() {
    this.el.innerHTML = this.template(this.model);
    return this;
  }
});

export default SettingsView;
