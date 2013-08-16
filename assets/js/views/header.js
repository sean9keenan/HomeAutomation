window.HeaderView = Backbone.View.extend({

    initialize: function () {

    },

    render: function () {

        $(this.el).html(this.template());

        //this.on('change:signedIn', onSignInChange);

        if (window.user.signedIn) {
            if (!this.loggedInDropdownView) {
                this.loggedInDropdownView = new LoggedInDropdownView();
                this.loggedInDropdownView.render();
            } else {
                this.loggedInDropdownView.delegateEvents(); // delegate events when the view is recycled
            }
            this.el.$('#dropdown').html(this.loggedInDropdownView.el);
        } else {
            if (!this.loginDropdownView) {
                this.loginDropdownView = new LoginDropdownView();
                this.loginDropdownView.render();
            } else {
                this.loginDropdownView.delegateEvents(); // delegate events when the view is recycled
            }
            $(this.el).find('#dropdown').html(this.loginDropdownView.el);
            // Fix input element click problem
            $(this.el).find('#dropdown input, #dropdown label').click(function(e) {
                e.stopPropagation();
            });

        }

        return this;
    },

    events: {
    },

    select: function(menuItem) {
        $('.nav-collapse .nav li').removeClass('active');
        $('.nav-collapse .' + menuItem).addClass('active');
    }

});

function onSignInChange(model, signedIn) {
    if (signedIn) {
        if (!this.loggedInDropdownView) {
            this.loggedInDropdownView = new LoggedInDropdownView();
            this.loggedInDropdownView.render();
        } else {
            this.loggedInDropdownView.delegateEvents(); // delegate events when the view is recycled
        }
        $('#dropdown').html(this.loggedInDropdownView.el);
    } else {
        if (!this.loginDropdownView) {
            this.loginDropdownView = new LoginDropdownView();
            this.loginDropdownView.render();
        } else {
            this.loginDropdownView.delegateEvents(); // delegate events when the view is recycled
        }
        $('#dropdown').html(this.loginDropdownView.el);
    }

};

window.user = new User();