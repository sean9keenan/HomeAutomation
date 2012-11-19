/**
 * DimmableDashboard#View
 * 
 * This view is created for each Device in the list. It responds
 * to client interaction and handles displaying changes to device model
 * received from the server.
 * 
 * In our case, it recieves a specific model on construction and 
 * binds to change events for whether the device is completed or not. 
 */

window.DimmableDashboard = Backbone.View.extend({
  className: 'device',
  events: {
    'click .completeBtn': 'completeDevice',
    'click .delete': 'deleteDevice'
  },
  initialize: function (model) {
    _.bindAll(this, 'setStatus', 'completeDevice', 'deleteDevice', 
      'setDisplay', 'setName');
    this.model = model;
    this.model.bind('change:completed', this.setStatus);
    this.model.bind('change:name', this.setName);
    this.model.bind('change:dashboard', this.setDisplay);
    this.render();
  },
  render: function () {
    $(this.el).html(this.template());
    $(this.el).attr('id', this.model.id);
    this.setStatus();
    this.setName();
    this.setDisplay();
    return this;
  },
  setDisplay: function () {
    if (this.model.get('dashboard')) {
      this.$('.square').css('display', 'block');
    } else {
      this.$('.square').css('display', 'none');
    }
  },
  setName: function () {
    this.$('.title').html(this.model.get('name'));
  },
  setStatus: function () {
    var status = this.model.get('completed');
    if (status) {
      // this.$('.status').addClass('complete');
      this.$('.square').addClass('complete');
    } else {
      // this.$('.status').removeClass('complete');
      this.$('.square').removeClass('complete');
    }
  },
  completeDevice: function () {
    // here we toggle the completed flag. we do NOT
    // set status (update UI) as we are waiting for
    // the server to instruct us to do so.
    var status = this.model.get('completed');
    this.model.save({ completed: !status
                    });
  },
  deleteDevice: function () {
    // Silent is true so that we react to the server
    // broadcasting the remove event.
    this.model.destroy({ silent: true });
  }
});