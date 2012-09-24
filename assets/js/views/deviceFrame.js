window.DeviceFrameView = Backbone.View.extend({

  devices: null,

  initialize:function (id) {
    _.bindAll(this, 'createDevice');
    this.idElement = id;
    console.log('Initializing Device Frame View');
  },

  events:{
  'click #addDevice': 'createDevice'
  },

  render:function () {
    $(this.el).html(this.template());
    this.devices = new window.Devices();
    this.$('#sidebarNav').html('');
    var list = new window.DeviceNav(this.devices, null);
    this.$('#sidebarNav').append(list.el);
    this.settingsFrameHolder = new window.DeviceSettingsFrameHolder(this.devices, this.idElement)
    this.devices.fetch();
    return this;
  },

  createDevice: function () {
    // We don't want ioBind events to occur as there is no id.
    // We extend Device#Model pattern, toggling our flag, then create
    // a new device from that.
    var Device = window.Device.extend({ noIoBind: true });
    
    var attrs = {
      name: 'New Device',
      type: 'light',
      state: 'off',
      completed: false,
      pinNum: null,
      dashboard: true,
      value: null,
      hostDevice: null,
      isAnalog: false,
      isOutput: true,
      defaultType: "light"
    };
    
    var _device = new Device(attrs);
    _device.save();
    //app.navigate("devices/" + _device.id, {trigger: true});
  },
  setId: function (id) {
    this.settingsFrameHolder.targetID = id;
    this.settingsFrameHolder.render();
    this.$('#deviceContent').html(this.settingsFrameHolder.el);
    if (id == null){
      this.$('#sidebarNav li').removeClass('active');
    }
  }

});

window.DeviceSettingsFrameHolder = Backbone.View.extend({
  tagName: 'div',
  events:{
  },
  initialize: function(devices, id) {
    _.bindAll(this, 'render', 'addDevice', 'removeDevice');
    
    this.devices = devices;
    
    this.targetID = id;

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

    if (this.targetID == null){
      $(this.el).html('<p>Dude, click on some links on the left, more content will be coming here eventually</p>');
    } else {
      this.devices.each(function (device) {
        self.addDevice(device);
      });
    }
    return this;
  },
  addDevice: function (device) {

    //Add the main content in!
    if (device.id == this.targetID){
      this.deviceContent = new window.DeviceSettingsFrame(device);
      $(this.el).hide().html(this.deviceContent.el).fadeIn(200); 
    }
  },
  removeDevice: function (device) {
  }
});

/**
 * DeviceSettingsFrame#View
 * 
 * This view is created for each Device in the list. It responds
 * to client interaction and handles displaying changes to device model
 * received from the server.
 * 
 * In our case, it recieves a specific model on construction and 
 * binds to change events for whether the device is completed or not. 
 */

window.DeviceSettingsFrame = Backbone.View.extend({
  className: 'deviceSettingsFrame',
  events: {
    'click .completeBtn': 'completeDevice',
    'click .deleteButton': 'deleteDevice',
    'click .btn#saveChanges': 'saveChanges',
    'change .controls#name': 'saveChanges',
    'change .hostDeviceDropdown': 'setHostDevice'
  },
  initialize: function (model) {
    _.bindAll(this, 'setStatus', 'completeDevice', 'deleteDevice', 'setName',
       'saveChanges', 'deviceDeleted', 'setPinNum', 'setDashboard',
       'setHostDeviceFromSave', 'setHostDevice');
    this.model = model;
    this.model.bind('change:completed', this.setStatus);
    this.model.bind('change:name', this.setName);
    this.model.bind('change:pinNum', this.setPinNum);
    this.model.bind('change:dashboard', this.setDashboard);
    this.model.bind('change:hostDevice', this.setHostDeviceFromSave);
    this.model.bind('delete', this.deviceDeleted);
    this.render();
    this.targetID = this.model.id;
  },
  render: function () {
    $(this.el).html(this.template());
    $(this.el).attr('id', this.model.id);
    this.setName();
    this.setPinNum();
    this.setDashboard();
    this.setStatus();
    this.setHostDeviceFromSave();

    $('#sidebarNav li').removeClass('active');
    $('#sidebarNav #'+this.model.id).addClass('active');

    //this.$('#name').change(this.saveChanges());

    return this;
  },
  setHostDeviceFromSave: function() {
    var hostDevice = this.model.get('hostDevice');
    //TODO: Set the hostDeviceDropdown here....
    setHostDevice();

  },
  setHostDevice: function() {
    this.hostDeviceSettings = new Window.DeviceSettingsArduino(this.model);
    this.$('.selectedDeviceFrame').hide().html(this.hostDeviceSettings.el).fadeIn(200); 
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
  setName: function() {
    var name = this.model.get('name');
    this.$('.title').html(name);
    if (name == 'New Device') {
      this.$('#name').val('');
    } else {
      this.$('#name').val(name);
    }

  },
  setPinNum: function() {
    var pinNum = this.model.get('pinNum');
    this.$('#inputPinNum').val(pinNum);
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
    this.model.save({ completed: !!!status });
  },
  deleteDevice: function () {
    // Silent is true so that we react to the server
    // broadcasting the remove event.
    this.model.destroy({ silent: true });
  },
  deviceDeleted: function() {
    if (document.URL.toString().indexOf(this.targetID.toString()) != -1){
      $('#messages').show().load('tpl/MessageAlert.html', function() {
        $('#messages .alert').attr('class', 'alert alert-error');
        $('#messages strong').html('DELETED');
        $('#messages .alertMessage').html('The model you were editing was deleted');
        setTimeout(function() {
          $('#messages').fadeOut(function() {
            $('#messages').html('');
          });
        }, 3*1000);
      });
      app.navigate("devices", {trigger: true});
    }
  },
  saveChanges: function () {
    this.model.save({
     name: this.$('#name').val(),
     dashboard: this.$('#dashboardCheck').is(':checked'),
     pinNum: this.$('#inputPinNum').val() 
   });
  }

});


/**
 * DeviceNavItem#View
 * 
 * This view is created for each Device in the list. It responds
 * to client interaction and handles displaying changes to device model
 * received from the server.
 * 
 * In our case, it recieves a specific model on construction and 
 * binds to change events for whether the device is completed or not. 
 */

window.DeviceNavItem = Backbone.View.extend({
  className: 'device',
  tagName:'li',
  events: {
    'click .completeBtn': 'completeDevice',
    'click .delete': 'promptForDelete',
    'click .deleteForSure': 'deleteDevice'
  },
  initialize: function (model) {
    _.bindAll(this, 'setName', 'completeDevice', 'deleteDevice', 'promptForDelete');
    this.model = model;
    this.model.bind('change:name', this.setName);
    this.render();
  },
  render: function () {
    $(this.el).html(this.template());
    //$(this.el).attr('id', this.model.id);
    this.$('a').attr('href', '#devices/' + this.model.get('id'));
    this.setName();
    return this;
  },
  setName: function () {
    this.$('#title').html(this.model.get('name'));
  },
  completeDevice: function () {
    // here we toggle the completed flag. we do NOT
    // set status (update UI) as we are waiting for
    // the server to instruct us to do so.
    var status = this.model.get('completed');
    this.model.save({ completed: !!!status });
  },
  promptForDelete: function() {

  },
  deleteDevice: function () {
    // Silent is true so that we react to the server
    // broadcasting the remove event.
    this.model.destroy({ silent: true });
  }
});


/**
 * DeviceList#View
 * 
 * This is the primary list of devices. It recieves the collection
 * upon construction and will respond to events broadcasted from
 * socket.io. 
 */

window.DeviceNav = Backbone.View.extend({
  id: 'DeviceNav',
  tagName: 'ul',
  className: 'nav nav-list bs-docs-sidenav bs-docs-sidewidth',
  initialize: function(devices, id) {
    _.bindAll(this, 'render', 'addDevice', 'removeDevice');
    
    this.devices = devices;
    
    this.targetID = id;

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
    var tdv = new window.DeviceNavItem(device);
    $(tdv.el).hide().appendTo(this.el).fadeIn(200);

    //Add the main content in!
    if (device.id == this.targetID){
      var deviceContent = new window.DeviceSettingsFrame(device);
      $('#deviceContent').hide().html(deviceContent.el).fadeIn(200);
    }
  },
  removeDevice: function (device) {
    var self = this
      , width = this.$('#' + device.id).outerWidth();

    // My own shiny animations!
    this.$('#' + device.id).fadeOut(200, function(){
      self.$('#' + device.id).remove();
    });
  }
});
