window.DeviceSettingsArduino = Backbone.View.extend({
  events: {
    'change .selectDeviceType' : 'setDefaultType'
  },
  initialize:function (model) {
    console.log('Initializing Device Settings Arduino View');
    _.bindAll(this, 'setDefaultTypeFromSave', 'setDefaultType', 
      'setPinNum', 'setDashboard')
    this.model = model;
    this.model.bind('change:defaultType', this.setDefaultTypeFromSave);
    this.model.bind('change:pinNum', this.setPinNum);
    this.model.bind('change:dashboard', this.setDashboard);
    this.render();
    this.targetID = this.model.id;
  },

  render:function () {
    $(this.el).html(this.template());
    this.setPinNum();
    this.setDashboard();
    return this;
  },
  setDefaultTypeFromSave: function() {
    var defaultType = this.mode.get('defaultType');
    //TODO: Set the dropdown for the default type here
    setDefaultType();
  },
  setDefaultType: function() {
    //TODO: Select which you want to inflate
    this.defaultTypeView = new window.DeviceSettingsLights(this.model);
    this.$('.defaultTypeViewContainer').hide().html(this.defaultTypeView.el).fadeIn(200);
  },

  setPinNum: function() {
    var pinNum = this.model.get('pinNum');
    this.$('#inputPinNum').val(pinNum);
  },
  setDashboard: function() {
    var status = this.model.get('dashboard');
    if (status) {
      // this.$('.status').addClass('complete');
      this.$('#dashboardCheck').attr('checked', true);
    } else {
      // this.$('.status').removeClass('complete');
      this.$('#dashboardCheck').attr('checked', false);
    }
  },
  saveChanges: function () {
    this.model.save({
     dashboard: this.$('#dashboardCheck').is(':checked'),
     pinNum: this.$('#inputPinNum').val() 
   });
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