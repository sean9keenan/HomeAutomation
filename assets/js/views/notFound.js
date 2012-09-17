window.NotFoundView = Backbone.View.extend({

    initialize:function () {
        console.log('Initializing 404 View');
    },

    render:function () {
        $(this.el).html(this.template());
        return this;
    }

});