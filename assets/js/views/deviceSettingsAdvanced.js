 window.DeviceSettingsAdvanced = Backbone.View.extend({

  initialize:function () {
    console.log('Initializing Advanced Device Settings View');
    this.render();
  },

  render:function () {
    $(this.el).html(this.template());
    return this;
  },


});