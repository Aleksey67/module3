const fs = require('fs');

const router = {
  '/': (req, res) => {
    res.end('main page');
  },
  '/products': (req, res) => {
    fs.readFile(__dirname + '/../db/products/all-products.json', 'utf8', (err, content) => {
      res.writeHead(200, {'Content-Type': 'application/json; charset=utf8'});
      res.end(content);
    });
  },
  '/signup': (req, res) => {
    if (req.method !== 'POST') {
      res.end('Only POST allowed');
      return;
    }

    let body = '';

    req.on('data', function (data) {
      body += data;
    });

    req.on('end', function () {
      let post = JSON.parse(body);
      res.writeHead(200, {'Content-Type': 'application/json'});
      let path = __dirname + '/../db/users/' + post.username + '.json';
      fs.writeFile(path, body, (err, result) => {
        let resJson = {
          status: 'success',
          user: post
        };
        res.end(JSON.stringify(resJson, null, 2));
      });
    });
  },
  default: (req, res) => {
    res.end('not found');
  }
};

module.exports = router; 