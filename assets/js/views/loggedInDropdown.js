window.LoggedInDropdownView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing Logged In Dropdown View');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    },


});