window.DeviceSettingsMain = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing Main Settings View');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    },


});