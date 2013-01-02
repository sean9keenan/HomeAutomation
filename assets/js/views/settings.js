 window.SettingsView = Backbone.View.extend({

  initialize:function () {
    console.log('Initializing Settings View');
  },

  events:{
    "click #update":"update"
  },

  render:function () {
    $(this.el).html(this.template());
    this.$("#address")[0].placeholder = window.socketAddress;
    return this;
  },

  update:function () {
    window.socket.disconnect();
    if ($("#address").val != null){
      window.socket = io.connect($("#address").val)
    }
  }


});