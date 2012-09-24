 window.ContactView = Backbone.View.extend({

  initialize:function () {
    console.log('Initializing Contact View');
  },

  render:function () {
    $(this.el).html(this.template());
    return this;
  },


});