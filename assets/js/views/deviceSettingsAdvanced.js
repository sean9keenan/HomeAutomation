 window.DeviceSettingsAdvanced = Backbone.View.extend({

  initialize:function () {
    console.log('Initializing Advanced Device Settings View');
    this.render();
  },

  render:function () {
    $(this.el).html(this.template());
    return this;
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