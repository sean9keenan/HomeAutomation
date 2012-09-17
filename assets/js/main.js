window.socket = io.connect('http://xp.skeenan.com:8080');


window.socket.on('connect', function() {

  $('#messages').fadeOut(function() {
    $('#messages').html('');
  });
});

window.socket.on('disconnect', function() {
  onSocketError();
});

window.socket.on('error', function(){
  onSocketError();
  console.log('socketError');
});
window.socket.on('connect_failed', function(){
  console.log('socketConnect_Failed');
});
window.socket.on('reconnect_failed', function(){
  console.log('socketReconnect_failed');
});

function onSocketError() {
  $('#messages').load('tpl/MessageAlert.html', function() {
    $('#messages .alert').attr('class', 'alert alert-error');
    $('#messages strong').html('ERROR');
    $('#messages .alertMessage').html('We lost the connection to the server!');

  });
}

window.Router = Backbone.Router.extend({

  routes: {
    "": "home",
    "contact": "contact",
    "devices/:id": "devices",
    "devices": "devices",
    "dashboard": "dashboard",
    "employees/:id": "employeeDetails",
    '*path':  'notFound'
  },

  initialize: function () {
    this.headerView = new HeaderView();
    $('.header').html(this.headerView.render().el);

    // Close the search dropdown on click anywhere in the UI
    $('body').click(function () {
        //$('.dropdown').removeClass("open");
    });

  },

  home: function () {
    // Since the home view never changes, we instantiate it and render it only once
    if (!this.homeView) {
        this.homeView = new HomeView();
        this.homeView.render();
    } else {
        this.homeView.delegateEvents(); // delegate events when the view is recycled
    }
    $("#content").html(this.homeView.el);
    this.headerView.select('home-menu');
  },

  notFound: function () {
    // Since the home view never changes, we instantiate it and render it only once
    if (!this.notFoundView) {
        this.notFoundView = new NotFoundView();
        this.notFoundView.render();
    } else {
        this.notFoundView.delegateEvents(); // delegate events when the view is recycled
    }
    $("#content").html(this.notFoundView.el);
    this.headerView.select('home-menu');
  },

  dashboard: function() {
    if (!this.dashboardView){
      this.dashboardView = new DashboardView();
      this.dashboardView.render();
    }
    $("#content").html(this.dashboardView.el);
    this.headerView.select('dashboard-menu');
    this.dashboardView.delegateEvents();
    this.dashboardView.list.delegateToItems();
  },

  devices: function (id) {
    if (!this.deviceFrameView){
        this.deviceFrameView = new DeviceFrameView();
        this.deviceFrameView.render();
    }
    this.deviceFrameView.setId(id);

    $("#content").html(this.deviceFrameView.el);
    this.deviceFrameView.delegateEvents();
    if (this.deviceFrameView.settingsFrameHolder.deviceContent != null){
      this.deviceFrameView.settingsFrameHolder.deviceContent.delegateEvents();
    }
    this.headerView.select('device-menu');

  },

  contact: function () {
    if (!this.contactView) {
        this.contactView = new ContactView();
        this.contactView.render();
    }
    $('#content').html(this.contactView.el);
    this.headerView.select('contact-menu');
  }

  // employeeDetails: function (id) {
  //     var employee = new Employee({id: id});
  //     employee.fetch({
  //         success: function (data) {
  //             // Note that we could also 'recycle' the same instance of EmployeeFullView
  //             // instead of creating new instances
  //             $('#content').html(new EmployeeView({model: data}).render().el);
  //         }
  //     });
  // }

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
    _.bindAll(this, 'render', 'addDevice', 'removeDevice', 'delegateToItems');
    
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
    var tdv = new window.DashboardItem(device);
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
  }
});

/**
 * AddDeviceView#View
 * 
 * This form handles adding new Devices to the server. The server
 * then broadcasts the new Device to all clients. We don't want our 
 * new Model instance to ioBind as no ID has been defined so we 
 * extend our original model and toggle our flag.
 */

window.AddDeviceView = Backbone.View.extend({
  id: 'DeviceForm',
  events: {
    'click .button#add': 'addDevice'
  },
  initialize: function (devices) {
    _.bindAll(this, 'addDevice');
    this.devices = devices;
    this.render();
  },
  render: function () {
    $(this.el).html(this.template());

    //$(this.el).html('<input id="DeviceInput"></input><a class="btn button" id="add" style="margin-left: 5px;">Add Button</a>');
    return this;
  },
  addDevice: function () {
    // We don't want ioBind events to occur as there is no id.
    // We extend Device#Model pattern, toggling our flag, then create
    // a new device from that.
    var Device = window.Device.extend({ noIoBind: true });
    
    var attrs = {
      name: this.$('#DeviceInput').val(),
      type: 'light',
      state: 'off',
      completed: false,
      pinNum: null,
      dashboard: true
    };
    
    // reset the text box value
    this.$('#DeviceInput').val('');
    
    var _device = new Device(attrs);
    _device.save();
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
    this.model.save({ completed: !!!status });
  },
  deleteDevice: function () {
    // Silent is true so that we react to the server
    // broadcasting the remove event.
    this.model.destroy({ silent: true });
  }
});




templateLoader.load(["ContactView", "HomeView", "HeaderView", "DashboardView", 
    "LoggedInDropdownView", "LoginDropdownView", "DeviceFrameView", "DashboardItem",
    "AddDeviceView", "DeviceNavItem", "NotFoundView", "DeviceSettingsFrame"],
    function () {
        app = new Router();
        Backbone.history.start();
    });