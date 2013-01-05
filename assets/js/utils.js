// The Template Loader. Used to asynchronously load templates located in separate .html files
window.templateLoader = {

  load: function(views, callback) {

    var deferreds = [];

    $.each(views, function(index, view) {

      var indexOfSlash = view.lastIndexOf("/")
      var dir = "";
      if (indexOfSlash != -1){
        //TODO: Um, make this work. Yup.
        dir = view.substring(0, indexOfSlash + 1);
        view = view.substring(indexOfSlash+1);
      }

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

//Simple Cookie manager

window.setCookie = function(c_name,value,exdays) {
  var exdate=new Date();
  exdate.setDate(exdate.getDate() + exdays);
  var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
  document.cookie=c_name + "=" + c_value;
}

window.getCookie = function(c_name){
  var i,x,y,ARRcookies=document.cookie.split(";");
  for (i=0;i<ARRcookies.length;i++)
  {
    x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
    y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
    x=x.replace(/^\s+|\s+$/g,"");
    if (x==c_name)
      {
      return unescape(y);
      }
    }
}