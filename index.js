const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const keys = require('./config/keys');
const cookieSession = require('cookie-session');
const http = require('http');
const path = require('path');
require('./models/User');
require('./models/Chat');
require('./models/Friend');
require('./services/passport');

mongoose.connect(keys.mongoURL)

const app = express();
const server = http.createServer(app);

require('./services/socket/index')(server);

app.use(express.json());

app.use(
    cookieSession({
        maxAge: 30 * 24 * 60 * 60 * 1000,
        keys: [keys.cookieKey],
    })
);
app.use(passport.initialize());
app.use(passport.session());

require('./routes/authRoutes')(app);
require('./routes/friendRoutes')(app);

if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/dist"));

  const path = require("path");
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

const PORT = process.env.PORT || 5000;
server.listen(PORT);

