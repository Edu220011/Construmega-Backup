const http = require('http');

const server = http.createServer((req, res) => {
  console.log('Request:', req.url);
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('Hello World\n');
});

server.listen(3001, '127.0.0.1', () => {
  console.log('Server listening on port 3001 (127.0.0.1)');
});