// The Template Loader. Used to asynchronously load templates located in separate .html files
window.templateLoader = {

  load: function(views, callback) {

    var deferreds = [];

    //TODO: Want last Index of
    var indexOfSlash = views.indexOf("//")
    var dir = "";
    if (indexOfSlash != -1){
      //TODO: Um, make this work. Yup.
      dir = views[0, indexOfSlash + 1];
      views = views[indexOfSlash];
    }

    $.each(views, function(index, view) {
      if (window[view]) {
        deferreds.push($.get('tpl/' + dir + view + '.html', function(data) {
          window[view].prototype.template = _.template(data);
        }, 'html'));
      } else {
        alert(view + " not found");
      }
    });

    $.when.apply(null, deferreds).done(callback);
  }

};