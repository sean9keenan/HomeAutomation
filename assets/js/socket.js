window.socketAddress = 'http://xp.skeenan.com:8080';

window.socket = io.connect(window.socketAddress, {
  // 'connect timeout': 1
});


window.socket.on('connect', function() {

  $('#messages').fadeOut(function() {
    $('#messages').html('');
  });
  console.log('connect');
});
window.socket.on('connecting', function(){
  console.log('connecting');
});

window.socket.on('disconnect', function() {
  onSocketError();
  console.log('disconnect');
});

window.socket.on('error', function(){
  onSocketError();
  console.log('socketError');
});
window.socket.on('connect_failed', function(){
  console.log('socketConnect_Failed');
});

window.socket.on('reconnect_failed', function(){
  console.log('socketReconnect_failed');
});
window.socket.on('reconnect', function(){
  if (app.dashboardView){
    app.dashboardView.remove()
    app.dashboardView.render()
    app.dashboard()
  }
  if (app.deviceFrameView){
    app.deviceFrameView.render()
  }
  console.log('reconnect');
});
window.socket.on('reconnecting', function(){
  console.log('reconnecting');
});

function onSocketError() {
  $('#messages').html('  <div class="alert">\
    <a class="close" data-dismiss="alert" href="#"> × </a>\
    <strong> </strong> <div class="alertMessage"> </div>\
  </div>');

  // $('#messages').load=('tpl/MessageAlert.html', function() {
    $('#messages .alert').attr('class', 'alert alert-error');
    $('#messages strong').html('ERROR');
    $('#messages .alertMessage').html('We lost the connection to the server!');

  // });
  $('#messages').fadeIn()
}