window.DeviceSettingsArduino = Backbone.View.extend({
  events: {
    'change .selectDeviceType' : 'setDefaultType'
  },
  initialize:function (model) {
    console.log('Initializing Device Settings Arduino View');
    _.bindAll(this, 'setDefaultTypeFromSave', 'setDefaultType', 
      'setPinNum', 'setDashboard', 'saveChanges')
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
    this.setDefaultTypeFromSave();
    return this;
  },
  setDefaultTypeFromSave: function() {
    var defaultType = this.model.get('defaultType');
    //TODO: Set the dropdown for the default type here
    this.setDefaultType();
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
  saveChanges: function (outModel) {
    var doForceInit = (this.$('#inputPinNum').val() != this.model.get('pinNum'))
    if (doForceInit){
      window.socket.emit('event',
       {outType:'arduino', msg: "cmd:initPin;pin:" + this.$('#inputPinNum').val() + ";type:" + "output" });
      window.socket.emit('event',
       {outType:'arduino', msg: "cmd:setPin;pin:" + this.model.get('pinNum') + ";type:" + "off" });
      var typeAppend = "off";
      if (this.model.get('completed')){
        typeAppend = "on";
      }
      window.socket.emit('event',
       {outType:'arduino', msg: "cmd:setPin;pin:" + this.$('#inputPinNum').val() + ";type:" + typeAppend });
      
    }
    console.log(outModel);
    jQuery.extend(outModel, {
     dashboard: this.$('#dashboardCheck').is(':checked'),
     pinNum: this.$('#inputPinNum').val(),
     pendingActions: [{target: this.targetID, action: "init"}]
    });

    if (this.defaultTypeView != null){
      jQuery.extend(outModel, this.defaultTypeView.saveChanges(this.$('#inputPinNum').val()));
    }

    this.model.save(outModel);
  }

});

window.DeviceSettingsLights = Backbone.View.extend({
  initialize:function(model){
    _.bindAll(this, 'saveChanges');
    this.model = model;
  },
  render: function() {
    return '';
  },
  saveChanges: function(pinNum) {
    //pinNum = this.model.get('pinNum');
    return ({
     outputs: [JSON.stringify({actionTrig: "state", global: 'on', action: '{"completed": "true"}',
                  outType: "arduino", msg: "cmd:setPin;pin:" + pinNum + ";type:" + "on"}),
               JSON.stringify({actionTrig: "state", global: 'off', action: '{"completed": "false"}', 
                  outType: "arduino", msg: "cmd:setPin;pin:" + pinNum + ";type:" + "off"}),
               JSON.stringify({actionTrig: "init", global: 'init', action: 'init', 
                  outType: "arduino", msg: "cmd:initPin;pin:" + pinNum + ";type:" + "output"})]
    });
  }
});