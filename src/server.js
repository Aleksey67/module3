const fs = require('fs');
const http = require('http');
const https = require('https');
const privateKey  = fs.readFileSync(__dirname + '/sslcert/server.key', 'utf8');
const certificate = fs.readFileSync(__dirname + '/sslcert/server.crt', 'utf8');
const credentials = {key: privateKey, cert: certificate};
const bodyParser = require('body-parser');
const express = require('express');
const app = express();

app.set('json spaces', 2);
app.use(bodyParser.json());

const morgan = require('morgan');
//const router = require('./routes/router');

const logger = morgan('combined');

const startServer = (httpPort, httpsPort) => {
  app.get('/products', function (req, res) {
    fs.readFile(__dirname + '/db/products/all-products.json', 'utf8', (err, json) => {
      let products = JSON.parse(json);
      if (req.query.category) {
        products = products.filter(prod => {
          return prod.categories.indexOf(req.query.category) !== -1;
        });
      }
      let status = 'success';
      if (products.length === 0) {
        status = 'no products';
      }
      
      res.send({
        status: status,
        products: products
      });
    });
  });

  app.get('/products/:ids', function (req, res) {
    let ids = req.params.ids.split(',').map(id => parseInt(id));
    fs.readFile(__dirname + '/db/products/all-products.json', 'utf8', (err, json) => {
      let products = JSON.parse(json);
      let resProducts = products.filter(prod => {
        return ids.indexOf(prod.id) !== -1;
      });
      res.send({
        status: 'success',
        products: resProducts
      });
    });
  });

  app.post('/signup', function (req, res) {
    let post = req.body;
    let body = JSON.stringify(post, null, 2);
    let path = __dirname + '/db/users/' + post.username + '.json';
    fs.writeFile(path, body, (err, result) => {
      res.send({
        status: 'success',
        user: post
      });
    });
  });

  app.post('/users', function (req, res) {
    let user = req.body;

    let usersPath = __dirname + '/db/users/all-users.json';
    fs.readFile(usersPath, 'utf8', (err, json) => {
      let users;
      if (err) {
        users = [];
      } else {
        users = JSON.parse(json);
      }

      user.id = Math.round(Math.random() * 1000000);
      users.push(user);

      let usersJson = JSON.stringify(users, null, 2);

      fs.writeFile(usersPath, usersJson, (err, result) => {
        res.send({
          status: 'success',
          user: user
        });
      });
    });
  });

  app.get('/users/:id', function (req, res) {
    let userId = req.params.id;
    fs.readFile(__dirname + '/db/users/all-users.json', 'utf8', (err, json) => {
      let users = JSON.parse(json);
      let user = users.find(user => user.id == userId);
      let result = user || {status: 'not found'};
      res.send(result);
    });
  });

  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);

  httpServer.listen(httpPort);
  httpsServer.listen(httpsPort);
};

module.exports = startServer;
