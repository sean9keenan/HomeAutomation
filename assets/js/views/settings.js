 window.SettingsView = Backbone.View.extend({

  initialize:function () {
    _.bindAll(this, 'update');
    console.log('Initializing Settings View');
  },

  events:{
    'click #update': 'update'
  },

  render:function () {
    $(this.el).html(this.template());
    this.$("#address")[0].placeholder = window.socketAddress;
    return this;
  },

  update:function () {
    if ($("#address").val() != null){
      window.socket.disconnect();
      window.setNewSocketAddress($("#address").val())
      window.setCookie("serverAddr", $("#address").val(), 365);
      console.log("Connecting to: " + window.socketAddress);
    }
  }

});
