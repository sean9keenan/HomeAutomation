
/**
 * Device#Model
 * 
 * The device model will bind to the servers `update` and
 * `delete` events. We broadcast these events on the completion
 * and removing of an event.
 * 
 * The `noIoBind` default value of false so that models that
 * are created via the collection are bound.
 * 
 */

window.Device = Backbone.Model.extend({
  urlRoot: 'device',
  noIoBind: false,
  socket:window.socket,
  initialize: function () {
    _.bindAll(this, 'serverChange', 'serverDelete', 'modelCleanup');

    /*!
     * if we are creating a new model to push to the server we don't want
     * to iobind as we only bind new models from the server. This is because
     * the server assigns the id.
     */
    if (!this.noIoBind) {
      this.ioBind('update', this.serverChange, this);
      this.ioBind('delete', this.serverDelete, this);
    }

  },
  serverChange: function (data) {
    // Useful to prevent loops when dealing with client-side updates (ie: forms).
    data.fromServer = true;
    this.set(data);
  },
  serverDelete: function (data) {
    if (this.collection) {
      this.collection.remove(this);
    } else {
      this.trigger('remove', this);
    }
    this.modelCleanup();
  },
  modelCleanup: function () {
    this.ioUnbindAll();
    return this;
  }
});


/**
 * Devices#Collection
 * 
 * The collection responds to `create` events from the 
 * server. When a new Device is created, the device is broadcasted
 * using socket.io upon creation.
 */

window.Devices = Backbone.Collection.extend({
  model: window.Device,
  url: 'devices',
  socket:window.socket,
  initialize: function () {
    _.bindAll(this, 'serverCreate', 'collectionCleanup');
    this.ioBind('create', this.serverCreate, this);
  },
  serverCreate: function (data) {
    // make sure no duplicates, just in case
    var exists = this.get(data._id);
    if (!exists) {
      this.add(data);
    } else {
      data.fromServer = true;
      exists.set(data);
    }
  },
  collectionCleanup: function (callback) {
    this.ioUnbindAll();
    this.each(function (model) {
      model.modelCleanup();
    });
    return this;
  }
});