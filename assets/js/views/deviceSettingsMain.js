window.DeviceSettingsMain = Backbone.View.extend({

  initialize:function () {
    console.log('Initializing Main Settings View');
    this.render();
  },

  render:function () {
    $(this.el).html(this.template());
    return this;
  },

});