
var socket = io.connect('http://localhost');
// socket.on('ping', function (data) {
  // console.log(data);
  // socket.emit('pong', { type: 'pong' });
// });
socket.on('engine', function (data) {
  console.log(data);
  var tr = $('<tr>').attr('class', 'new');
  tr.append($('<td>').text(data.username));
  tr.append($('<td>').text(data.uniid));
  tr.append($('<td>').text(data.email));
  tr.append($('<td>').text(data.probinderid));
  $('#studentinfo_'+data.courseid).append(tr);
});