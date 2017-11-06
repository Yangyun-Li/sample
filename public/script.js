var socket = io.connect();

function setUsername() {
  if ($("#username").val() != ""){
    socket.emit('setUsername', $("#username").val());
    $('#chatControls').show();
    $('#table').show();
    $("#error1").hide();
    $('#username').hide();
    $('#userSet').hide();
  }else{
    $('#field1').addClass("error");
    $("#error1").show();
  }
}

function addMessage(msg, username) {
  var children = $("#log").children();
  if(children.length == 10)  children[9].remove();
  $("#log").prepend('<div class="ui list"><div class="item"><i class="history icon"></i><div class="content"><p>'
                  + username + ' : '
                  + msg
                  + '</p></div></div></div>');
}

function addToList(word, username) {
    $("#listEntries").append('<li>' + username + ' --- ' + word + '</li>');
}

function sendMessage(mes) {
    if ( mes != ""){
        if(mes.startsWith("/ban")){
            var bnword = mes.split(" ");
            socket.emit('bannedwords', bnword[1]);
            $('#messageInput').val('');
        }else{
            socket.emit('message', mes);
            addMessage(mes, "Me");
            $('#messageInput').val('')
        }

    }
}
socket.on('addBannedWords', function(data){
    addToList(data['bannedwords'], data['username']);
})
// Tell the socket that every time is gets a `message` type message it should
// call addMessage
socket.on('message', function(data) {
    // db.collection(x500 + '_bannedword').find().toArray(
    //   function(err, words){
    //       var flag = 0;
    //       for(i in words){
    //           if(data['message'].includes(words[i]['bannedwords'])){
    //             flag = 1;
    //           }
    //       }
    //       if(flag == 0){
    //           // socket.broadcast.emit('message', data);
    //           // db.collection(x500 + '_messages').insert(data, function(err, ids){})
    //           addMessage(data['message'], data['username']);
    //       }
    //   })

    // if(!flag){
    addMessage(data['message'], data['username']);
    // }
})

// Wait until jquery is loaded because we going to need it
$(function() {
    // Hide the chat controls, we don't want the user sending messages until
    // they have given us a username
    var res = "";
    $("#chatControls").hide();
    $("#table").hide();
    $("#error1").hide();

    // If the user clicks the button to set their username we call setUsername
    $("#userSet").click(function() {setUsername()});

    // If the user clicks the button to send a message we call sendMessage
    $("#submit").click(function() {sendMessage("haha");});
    $(".btn").click(function(){
      if(res == "" || res == "0") $("#screen").text($(this).text());
      else $("#screen").append($(this).text());
      res += $(this).text();
    });

    $("#btnEqual").click(function(){
      var val = eval(res);
      $("#screen").text(val);
      res += "=" + val;
      sendMessage(res);
      res = "";
    });
})
