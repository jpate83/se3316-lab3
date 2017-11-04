Handlebars.registerHelper('momentFormat', function(date) {
    return moment(date).format('MMM D, YYYY @ hh:mm a');
});


var socket = io();

var cs1form;
var cs2form;
var cs1messages;
var cs2messages;
var messageTemplate;

window.onload = function() {
    cs1form = document.getElementById("cs1-form");
    cs2form = document.getElementById("cs2-form");
    cs1messages = document.getElementById("cs1-messages");
    cs2messages = document.getElementById("cs2-messages");
    
    messageTemplate = Handlebars.compile(document.getElementById("message-template").innerHTML);
    
    updateList();
}
socket.on('refresh', function() {
    updateList();
});

function clearForm() {
    setTimeout(function() {
        cs1form.reset();
        cs2form.reset();
    }, 0);
}
function updateList() {
    socket.emit('get/messages', function(resp) {
        var cs1res = resp.cs1;
        if (cs1res) {
            var str = cs1res.reduce(function(accum, message) {
                return accum + messageTemplate(message);
            }, '');
            cs1messages.innerHTML = str;
        }
        var cs2res = resp.cs2;
        if (cs2res) {
            var str = cs2res.reduce(function(accum, message) {
                return accum + messageTemplate(message);
            }, '');
            cs2messages.innerHTML = str;
        }
    });
}