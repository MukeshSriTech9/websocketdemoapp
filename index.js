const express = require('express');
const socketio = require('socket.io');
const http = require("http");
const Redis = require("ioredis");
const port = 3001 || process.env.PORT;
const app = express();
const httpServer = http.createServer(app);

const redisClient = new Redis();
const { RedisSessionStore } = require("./sessionStore");
const sessionStore = new RedisSessionStore(redisClient);

const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
// Wasn't needed.
//   adapter: require("socket.io-redis")({
//     pubClient: redisClient,
//     subClient: redisClient.duplicate(),
//   }),
});

//MiddleWares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

// Authentication before connection
io.use(async (socket, next) => {
    const sessionID = socket.handshake.auth.sessionID;
    const authToken = socket.handshake.auth.authToken;
    const source    = socket.handshake.auth.source;
    console.log("new connection request- ", sessionID, authToken, source);

    if (sessionID && authToken && source) {
      const session = await sessionStore.findSession(sessionID);
      
      if (session) {
        if (source == 'controller' && session['controller_token'] == authToken) {
            socket.authToken = session['controller_token'];
        } else if (source == 'presentation' && session['presentation_token'] == authToken) {
            socket.authToken = session['presentation_token'];
        } else {
            return next(new Error("Invalid/Empty source provided"));
        }
        socket.sessionID = sessionID;
        socket.source = source;
        socket.channel_id = session['channel_id'];

        return next();
      } else {
        return next(new Error("Invalid SessionId/AuthToken"));
      }

    } else {
        return next(new Error("AuthToken/SessionID is not provided"));
    }
});

io.on('connection', (socket) => {
    console.log('New user joined');
    
    // join the "channel_id" room
    socket.join(socket.channel_id);

    // forward the private message to the right recipient (and to other tabs of the sender)
    socket.on("private message", ({ content}) => {
        const message = {
            content,
            from: socket.source,
        };

        socket.to(socket.channel_id).emit("private message", message); 
    });
});

httpServer.listen(port, () => {
  console.log(`App has been started at port ${port}`);
});