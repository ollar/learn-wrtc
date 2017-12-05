import Template from '../templates/settings';

const SettingsView = Backbone.View.extend({
  template: Template,

  events: {
    'click .test': 'submit',
  },

  submit(e) {
    e.preventDefault();
    console.log('this')
  },

  render() {
    // this.el.innerHTML = this.template(this.model);
    this.$el.html(this.template(this.model));

    console.log(this.$el)

    return this;
  }
});

export default SettingsView;
