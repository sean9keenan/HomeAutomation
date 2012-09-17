window.DashboardView = Backbone.View.extend({
  
  className: 'dashboard',
  
  initialize:function () {
      console.log('Initializing Dashboard View');
  },

  render:function () {
    $(this.el).html(this.template());
    var devices = new window.Devices();

    this.$('#devices').html('');
    
    var form = new window.AddDeviceView(devices);
    this.$('#devices').append(form.el);

    this.list = new window.DeviceList(devices);
    this.$('#devices').append(this.list.el);
    devices.fetch();
    return this;
  },

  remove: function () {
  }

});