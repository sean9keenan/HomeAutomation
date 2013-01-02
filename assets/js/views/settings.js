 window.SettingsView = Backbone.View.extend({

  initialize:function () {
    console.log('Initializing Settings View');
  },

  render:function () {
    $(this.el).html(this.template());
    return this;
  },


});