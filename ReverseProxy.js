const http = require('http');
const httpProxy = require('http-proxy');

// Khởi tạo Reverse Proxy
const proxy = httpProxy.createProxyServer();
var count = 0
// Cấu hình các server backend
// const backendServers = 
//   { 5001: 0 ,
//     5002: 0 }
const backendServers = 
  { 5001: 0 }
// Tìm server backend có số kết nối ít nhất
function findLeastConnectionServer() {
  let min = {key: 5001, val: 99}
  for(var key in backendServers){
    if(min.val > backendServers[key]){
      min.val = backendServers[key]
      min.key = key
    }
  }

  return min.key;
}
const origin = {'Access-Control-Allow-Origin': 'http://localhost:3000'};
// Tạo server proxy
const server = http.createServer((req, res) => {
  count++;
  // Chọn server backend có số kết nối ít nhất
  const leastConnectionServer = findLeastConnectionServer();
  backendServers[leastConnectionServer]++;
  const options = {
    hostname: 'localhost',
    port:  leastConnectionServer,
    path: req.url,
    method: req.method,
    headers: req.headers
  }
  console.log(leastConnectionServer, count)
  makeReq(options, req, res)
});
const makeReq = (options, req, clientRes) => {
  const proxy = http.request(options, res => {
    clientRes.writeHead(res.statusCode, res.headers, origin)
    res.pipe(clientRes, {end: true})

    backendServers[options.port]--;
  })
  req.pipe(proxy, {end: true})
}

server.listen(9999, () => {
  console.log('Server proxy đã khởi động trên cổng 9999');
});
