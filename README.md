# Module2 small project #
__Submitted by:__ lixx3524@umn.edu

This projects is intended to get you started with
[Express](https://expressjs.com/),
[WebSockets](http://socket.io/), and
[MongoDB](https://www.mongodb.com/).

The end result of this will be a basic chat room.

## Getting _something_ to show up ##
To get started make sure that you have `npm` installed on your machine. Use
`npm init` to setup your project directory.

The first thing that we need to do is get a basic Express server up and
running. To do that we need to the express module.

```
npm install express --save
```

Now we need to make our server. Create a file called `server.js`.

```javascript
var express = require('express');

app = express();

app.use(express.static('public')) // We will want this later

app.get('/', function(req, res){
    res.sendFile( __dirname + '/' + 'index.html' );
    })

var port = process.env.PORT || 3000; // For when we deploy to Heroku
app.listen(port)
```

Then you also need to create `index.html`.

```html
<!DOCTYPE html>
<html>
<body>
    <div class="container">
        <header>
            <h1>A super basic chat app</h1>
        </header>
        <input type="text" id="username"><button id="userSet">Set username</button>
        <div id="chatEntries"></div>
        <div id="chatControls">
            <input type="text" id="messageInput">
            <button id="submit">Send</button>
        </div>
    </div>
</body>
</html>
```

Start up the server locally using `node server.js`, then go to `localhost:3000`.
Make sure that you see what you are expecting to see.

## Get Chatting ##
Now that we have the basics worked out, let's start some conversations. To do
this we are going to need some WebSockets.

```
npm install socket.io --save
```

We will need to make some changes to both on the client side and the server
side.

### Server side ###

Let's start with the server.

In `server.js` replace

```javascript
app.listen(port)
```

with
```javascript
var server = app.listen(port)

var io = require('socket.io').listen(server);
io.sockets.on('connection', function (socket) {
    socket.on('setUsername', function (data) {
        socket.username = data
    })
    socket.on('message', function (message) {
        var data = { 'message' : message, 'username': socket.username }
        socket.broadcast.emit('message', data);
    })
})
```

Check and make sure your server still runs using `node server.js`. We aren't
expecting to see anything different, but we do want to make sure we didn't
break anything.

### Client side ###
Now lets add some stuff for the client. We are going to walk through
creating `public/script.js`.

First we are going to create a WebSocket connection to our server.
```javascript
var socket = io.connect();
```

Let's get ready to handle input and output from the socket. There are three
tasks we're going to need to perform:

- Set the user's username
- Add messages from the socket to the html
- Send messages from the browser to our server

Let's start with setting the username.

```javascript
function setUsername() {
    if ($("#usernameInput").val() != "")
    {
        socket.emit('setUsername', $("#username").val());
        $('#chatControls').show();
        $('#username').hide();
        $('#userSet').hide();
    }
}
```

Later we will make it so this function is called when the user clicks the
button to set their username, but for the moment let's walk through the logic.

First we use jquery (`$("#usernameInput")`) to get the username input box.
We check to make sure it isn't empty, if it isn't we continue on. We use the
socket that we created earlier to send a `'setUsername'` message to the server
along with the value of our username. Note that `'setUsername'` is arbitrary,
we could be using any string that we felt like. After we send the message we
change into chat mode, showing our chat controls and hiding the input box for
the username.

We'll skip over sending messages for the moment to work on adding any messages
that we might receive.

```javascript
function addMessage(msg, username) {
    $("#chatEntries").append('<div class="message"><p>' + username + ' : ' + msg + '</p></div>');
}
```

We use jquery to find our `chatEntries` element and then appending the message
to the end of the entries.

Now let's go back and work on to sending a message.

```javascript
function sendMessage() {
    if ($('#messageInput').val() != "")
    {
        socket.emit('message', $('#messageInput').val());
        addMessage($('#messageInput').val(), "Me");
        $('#messageInput').val('')
    }
}
```
Like before we use jquery to get the message input box and make sure it isn't
empty. We then use our socket to send a `message` message to our server along
with the user's input. We then use the `addMessage` function that we defined
earlier to add the message to our own chat. This is because the server will
broadcast the message out to everyone else, but they aren't going to send it
back to us. Finally we clear text out of the message box.

We have all of hard functions written, now we just need to connect them to
the relevant events.

```javascript
// Tell the socket that every time is gets a `message` type message it should
// call addMessage
socket.on('message', function(data) {
    addMessage(data['message'], data['username']);
})

// Wait until jquery is loaded because we going to need it
$(function() {
    // Hide the chat controls, we don't want the user sending messages until
    // they have given us a username
    $("#chatControls").hide();

    // If the user clicks the button to set their username we call setUsername
    $("#userSet").click(function() {setUsername()});

    // If the user clicks the button to send a message we call sendMessage
    $("#submit").click(function() {sendMessage();});
})
```

The final step is to make sure that this script and the ones it depends on
get loaded in with `index.html`. To do this we need to include `socket.io`,
`jquery`, and `script.js` to `index.html`. Do this by adding

```html
<head>
    <title>Chat</title>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
    <script src="/socket.io/socket.io.js"></script>
    <script src="script.js"></script>
</head>
```
 just after the `<html>` tag. Now restart your server and get chatting.


## Keep a chat history ##
_----- Tangent -----_

Sometimes things can get confusing if you can't actually get direct access to
your database. If you would like to have access you can
[install mongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition)
then connect using
```
mongo ec2-54-175-174-41.compute-1.amazonaws.com:80/5117-individual -u 5117user -p 5117pass
```
More documentation on using mongo shell can be found
[here](https://docs.mongodb.com/manual/mongo/#working-with-the-mongo-shell).

_----- End Tangent -----_

We are going to keep a chat history using MongoDB.

   npm install --save mongodb

Make some changes in `server.js`,
```javascript
var MongoClient = require('mongodb').MongoClient;
var mongoURI = 'mongodb://ec2-54-175-174-41.compute-1.amazonaws.com:80/'
var db_name = "5117-individual"
var db_user = "5117user"
var db_pswd = "5117pass"
var x500 = "<your_x500>" // <-- Replace this with your x500
MongoClient.connect(mongoURI + db_name, function(err, db){
  if (err) {
    throw err;
  }
  else {
    db.authenticate(db_user, db_pswd, function(err, result) {
      if (err) {
        throw err;
      }
      else {
        // Everything that was in the file before goes here
      }
    })
  }
})
```

We can then update `socket.on('message')` to store messages.

```javascript
socket.on('message', function (message) {
    var data = { 'message' : message, 'username': socket.username }
    socket.broadcast.emit('message', data);
    db.collection(x500 + '_messages').insert(data, function(err, ids){}) // <--
})
```
Great! Now we are storing chat logs, but we still need to do something with
them. It turns out that we can use `ejs`.

```
npm install ejs --save
```

Now move `index.html` to `views/index.ejs`. In `server.js` set the app's view
engine to `ejs`

```javascript
app.use(express.static('public')) // <-- This line is already in your file
app.set('view engine', 'ejs') // <-- Line you are adding
```

Then change `app.get('/')` to use the new `ejs` template.

```javascript
// res.sendFile( __dirname + '/' + 'index.html' );
res.render('index')
```

Run the server again and make sure everything is still working.

Now we are going to actually start using the stored data. In `index.ejs`
replace `<div id="chatEntries"></div>` with

```html
<div id="chatEntries">
    <% messages.forEach(function(msg){ %>
        <div class="message"><p> <%= msg.username %>  :  <%= msg.message %> </p></div>
    <% }) %>
</div>
```

and in `server.js` retrieve and pass the message history to our template.

```javascript
app.get('/', function(req, res){
    db.collection(x500 + '_messages').find().toArray(
        function(err, all_messages){
            res.render('index', {'messages': all_messages})
        })
    })
```

Start your server up again, reload your browser and make sure we are now
getting a message history.

## Censorship, a necessary evil? ##
_Your scientists were so preoccupied with whether or not they could, they
didn’t stop to think if they should._

We want to maintain a civil chat room. To do this we need to ban certain words.
Implement a feature that will allow users to enter `/ban <word>` and have all
subsequent messages containing the banned word rejected. You don't need to
notify them or prevent the word from appearing on screen of the person that
said it, a shadow ban is fine.

You are free to do this however you think is best.

I would probably recommend making a new collection of banned words
in MongoDB and checking words against it. MongoDB has some good documentation
on how to iterate over collections. You could use
[`toArray`](https://docs.mongodb.com/manual/reference/method/cursor.toArray/#cursor.toArray)
like we did for `app.get('/')` in `server.js`. You could also use
[`forEach`](https://docs.mongodb.com/manual/reference/method/cursor.forEach/).

Strings in javascript have a [`.startsWith`](http://www.w3schools.com/jsref/jsref_startswith.asp)
method that might be helpful to find `/ban` in incoming messages. They also
have a [`.slice`](http://www.w3schools.com/jsref/jsref_slice_string.asp) method
that should be helpful in finding the word they want to ban. If you are having
trouble with white space you can also use [`.trim`](http://www.w3schools.com/jsref/jsref_trim_string.asp).

## Banned words list ##
We also pride ourselves on being transparent, so make another url
(`/banned-words`) that lists out the banned words and the user that requested
the ban. This list should automatically update when new words are added.



## Submitting ##
- Make sure your code is up-to-date on GitHub.
- Add your Heroku website url to your repo's description.
- Add your email to the top of this `README.md`


## Acknowledgements ##
This assignment is an update and extension of a tutorial by
[Guillaume Besson](https://tutsplus.com/authors/guillaume-besson)

Tutorial:
[Using Node.js and Websockets to Build a Chat Service](https://code.tutsplus.com/tutorials/using-nodejs-and-websockets-to-build-a-chat-service--net-34482)
