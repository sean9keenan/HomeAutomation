window.DeviceSettingsArduino = Backbone.View.extend({
  events: {
    'change .selectDeviceType' : 'setDefaultType'
  },
  initialize:function (model) {
    console.log('Initializing Device Settings Arduino View');
    _bindAll(this, 'setDefaultTypeFromSave', 'setDefaultType')
    this.model = model;
    this.model.bind('change:defaultType', this.setDefaultTypeFromSave);
    this.render();
    this.targetID = this.model.id;
  },

  render:function () {
    $(this.el).html(this.template());
    return this;
  },
  setDefaultTypeFromSave: function() {
    var defaultType = this.mode.get('defaultType');
    //TODO: Set the dropdown for the default type here
    setDefaultType();
  },
  setDefaultType: function() {
    this.defaultTypeView = new Window.DeviceSettingsLights(this.model);
    this.$('.defaultTypeViewContainer').hide().html(this.defaultTypeView.el).fadeIn(200);
  }

});

window.DeviceSettingsLights = Backbone.View.extend({
  initialize:function(model){
    //Maybe something will be done here Eventually 
    // (Actually probably not for Lights, but who knows?)
  },
  render: function() {
    return '';
  }
});