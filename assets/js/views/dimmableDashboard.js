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
    'click .delete': 'deleteDevice'
  },
  initialize: function (model) {
    _.bindAll(this, 'setStatus', 'completeDevice', 'deleteDevice', 
      'setDisplay', 'setName', 'initDial', 'setValue');
    this.model = model;
    this.model.bind('change:completed', this.setStatus);
    this.model.bind('change:name', this.setName);
    this.model.bind('change:dashboard', this.setDisplay);
    this.model.bind('change:value', this.setValue);
    this.render();
  },
  render: function () {
    $(this.el).html(this.template());
    $(this.el).attr('id', this.model.id);
    this.$('#dim').attr('id', 'dim' + this.model.id);
    this.setName();
    this.setDisplay();
    this.initDial(this);
    this.setValue();
    return this;
  },
  remove: function () {
    if (this.removeDial != null){
      this.removeDial();
    }
    $(this.el).remove();
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
  setValue: function() {
    if (this.setValueFunc){
      this.setValueFunc(this.model.get('value'));
    }
    weight = 1 - (this.model.get('value') / 255)
    var weightColors = function(color1, color2, weight){
      out = ((color1 - color2) * weight + color2).toString(16)
      if (out.indexOf(".") == 1 || out.length <= 1){
        return "0" + out[0]
      } else {
        return out[0] + out[1]
      }
    }
    colorOut = '#' + weightColors(0xEE,0xFF,weight) + weightColors(0xEE,0xF0,weight) + weightColors(0xEE,0xA0,weight)
    this.$('.square').css('background-color', colorOut);
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
  },
  initDial: function( dimmableThis ) {
        dimmableThis.canCall = true
        dimmableThis.beenUpdated = true
        dimmableThis.mostRecentE = null
        dimmableThis.ignoreNextValue = false;
    YUI().use('dial', function(Y) {

      // var sceneH = Y.one('#scene').get('region').height,
      // subSea = 450,
      // viewFrameH = Y.one('#view_frame').get('region').height -2,
      // zeroPt = 100,
      // originY = -sceneH + subSea + viewFrameH - zeroPt;

      // Y.one('#scene').setStyle('top', originY + 'px');



      /**
      * The Dial's valueChange event is passed to this.
      * sets the CSS top value of the pictoral scene of the earth to the hubble.
      * This scene is an absolute positioned div inside another div with
      * overflow set to hidden.
      */
      dimmableThis.onUpdate = onUpdate = function(e) {
        // Y.one('#scene').setStyle('top', (originY + (e.newVal * 10)) + 'px');
        if (dimmableThis.ignoreNextValue == false){
          if (dimmableThis.canCall) {
            // console.log(e.newVal + "vs: " + dial.get('value'))
            dimmableThis.model.save({ value: e.newVal });
            dimmableThis.canCall = false
            dimmableThis.beenUpdated = true
            setTimeout(function(){
              dimmableThis.canCall = true;
              if (!dimmableThis.beenUpdated && dimmableThis.mostRecentE != null) {
                dimmableThis.onUpdate(dimmableThis.mostRecentE)
              }
            }, 100);
          } else {
            dimmableThis.beenUpdated = false;
            dimmableThis.mostRecentE = e;
          }
        } else {
          dimmableThis.ignoreNextValue = false;
        }
      }

      var dial = new Y.Dial({
        min:0,
        max:255,
        stepsPerRevolution:275,
        value: dimmableThis.model.get('value'),
        diameter: 100,
        minorStep: 1,
        majorStep: 10,
        decimalPlaces: 0, 
        strings:{label:'Power:', resetStr: 'On/Off', tooltipHandle: 'Drag to set'},
        // construction-time event subscription
        after : {
          valueChange: Y.bind( onUpdate, dial )
        }
      });

      dimmableThis.setValueFunc = function(val){
        if (dial.get('value') != val){
          dimmableThis.ignoreNextValue = true;
          dial.set('value',val);
        }
      }

      dimmableThis.removeDial = function(){
        dial.destroy();
      }

      dial._resetDial = function(e){
        if(e){
          e.stopPropagation(); //[#2530206] need to add so mousedown doesn't propagate to ring and move the handle
        }
        console.log(this.get('value'));
        value = this.get('value')
        if (value != 0){
          window.lastNonZeroValue = value
          this.set('value', 0);
        } else {
          if (window.lastNonZeroValue){
            this.set('value', window.lastNonZeroValue)
          } else {
            this._setToMax();
          }
        }
        this._handleNode.focus();

      }
      $('#dim' + dimmableThis.model.id).livequery(function(){
        dial.render('#dim' + dimmableThis.model.id);
      })

      // Function that calls a method in Dial that sets its value to the value of the max config attribute 
      // Other methods available include,
      // _setToMin(), _resetDial(), _incrMinor(), _decrMinor(), _incrMajor(), _decrMajor(),  
      var setDialToMax = function(e){
        e.preventDefault();
        this._setToMax();
      }

      
      // Subscribe to the click of the "Hubble" anchor, passing the dial as the 'this'
      Y.on('click', setDialToMax, '#a-hubble', dial);

    });
  }
});


