window.DashboardView = Backbone.View.extend({
  
  className: 'dashboard',
  
  initialize:function () {
      console.log('Initializing Dashboard View');
  },

  render:function () {
    $(this.el).html(this.template());
    var devices = new window.Devices();

    this.$('#devices').html('');

    this.list = new window.DeviceList(devices);
    this.$('#devices').append(this.list.el);
    devices.fetch();
    return this;
  },

  remove: function () {
    this.list.remove()
    $(this.el).remove();
  }

});


/**
 * DeviceList#View
 * 
 * This is the primary list of devices. It recieves the collection
 * upon construction and will respond to events broadcasted from
 * socket.io. 
 */

window.DeviceList = Backbone.View.extend({
  id: 'DeviceList',
  dashboardArray: [],
  initialize: function(devices) {
    _.bindAll(this, 'render', 'addDevice', 'removeDevice', 'delegateToItems',
      'inflateDevice');
    
    this.devices = devices;
    
    // this is called upon fetch
    this.devices.bind('reset', this.render);
    
    // this is called when the collection adds a new device from the server
    this.devices.bind('add', this.addDevice);
    
    // this is called when the collection is told to remove a device
    this.devices.bind('remove', this.removeDevice);
    
    this.render();
  },
  render: function () {
    var self = this;
    
    this.devices.each(function (device) {
      self.addDevice(device);
    });
    
    return this;
  },
  addDevice: function (device) {
    thisWindow = this;  //abusing scope :/
    device.bind('change:defaultType', function(){
      thisWindow.removeDevice(device);
      thisWindow.inflateDevice(device);
    })
    this.inflateDevice(device)
  },
  inflateDevice: function(device){
    var tdv = null
    if (device.get('defaultType') == "Dimmable Lights"){
      tdv = new window.DimmableDashboard(device);
    } else {
      tdv = new window.DashboardItem(device);
    }
    this.dashboardArray.push(tdv);
    $(tdv.el).hide().appendTo(this.el).fadeIn(200);
    //$(this.el).append(tdv.el).hide().fadeIn(2000);
  },
  removeDevice: function (device) {
    var self = this
      , width = this.$('#' + device.id).outerWidth();

    // My own shiny animations!
    this.$('#' + device.id).fadeOut(200, function(){
      self.$('#' + device.id).remove();
    });
  },
  delegateToItems: function () {
    for (var i=0; i < this.dashboardArray.length; i++){
      this.dashboardArray[i].delegateEvents();
    }

    // this.dashboardArray.each(function (tdv) {
    //   tdv.delegateEvents();
    // });
  },
  remove: function(){
    for (var i = this.dashboardArray.length - 1; i >= 0; i--) {
      this.dashboardArray[i].remove();
    };
  }
});


/**
 * DashboardItem#View
 * 
 * This view is created for each Device in the list. It responds
 * to client interaction and handles displaying changes to device model
 * received from the server.
 * 
 * In our case, it recieves a specific model on construction and 
 * binds to change events for whether the device is completed or not. 
 */

window.DashboardItem = Backbone.View.extend({
  className: 'device',
  events: {
    'click .completeBtn': 'completeDevice',
    'click .delete': 'deleteDevice'
  },
  initialize: function (model) {
    _.bindAll(this, 'setStatus', 'completeDevice', 'deleteDevice', 
      'setDisplay', 'setName');
    this.model = model;
    this.model.bind('change:completed', this.setStatus);
    this.model.bind('change:name', this.setName);
    this.model.bind('change:dashboard', this.setDisplay);
    this.render();
  },
  render: function () {
    $(this.el).html(this.template());
    $(this.el).attr('id', this.model.id);
    this.setStatus();
    this.setName();
    this.setDisplay();
    return this;
  },
  setDisplay: function () {
    if (this.model.get('dashboard')) {
      this.$('.square').css('display', 'block');
    } else {
      this.$('.square').css('display', 'none');
    }
  },
  setName: function () {
    this.$('.title').html(this.model.get('name'));
  },
  setStatus: function () {
    var status = this.model.get('completed');
    if (status) {
      // this.$('.status').addClass('complete');
      this.$('.square').addClass('complete');
    } else {
      // this.$('.status').removeClass('complete');
      this.$('.square').removeClass('complete');
    }
  },
  completeDevice: function () {
    // here we toggle the completed flag. we do NOT
    // set status (update UI) as we are waiting for
    // the server to instruct us to do so.
    var status = this.model.get('completed');
    this.model.save({ completed: !status
                    });
  },
  deleteDevice: function () {
    // Silent is true so that we react to the server
    // broadcasting the remove event.
    this.model.destroy({ silent: true });
  }
});
