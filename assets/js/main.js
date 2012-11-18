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




templateLoader.load(["ContactView", "HomeView", "HeaderView", "DashboardView", 
    "LoggedInDropdownView", "LoginDropdownView", "DeviceFrameView", "DashboardItem",
    "DeviceNavItem", "NotFoundView", "DeviceSettingsFrame",
    "DeviceSettings/DeviceSettingsArduino", "DeviceSettings/DeviceSettingsAdvanced",
    "DeviceSettings/DeviceSettingsMain"],
    function () {
        app = new Router();
        Backbone.history.start();
    });