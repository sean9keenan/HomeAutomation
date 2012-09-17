window.User = Backbone.Model.extend({
    idAttribute: "_id",
    //urlRoot: "/data/model/user",
    // set defaults for checking existance in the template for the new model
    defaults: {
      signedIn : false
    }
});

