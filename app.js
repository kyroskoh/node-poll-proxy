var express = require('express');
var server = express.createServer();
var url = require('url');
var http = require('http');

var nowjs = require("now");
var everyone = nowjs.initialize(server);

everyone.now.logStuff = function(msg){
    console.log(msg);
}

everyone.now.get = function(data, predicate, cb) {
  var u = url.parse(data.url);
  //TODO these options:
  //    interval: 500,
  //    backoff: false,
  //    max: 40,
  var options = {
    host: u.host,
    port: 80,
    path: u.pathname + u.search,
  };
  console.log('get ' + u.host);
  console.log(options.path);

  http.get(options, function(resp){
    var chunks = [];
    resp.on('data', function(chunk){
      // TODO translate relative paths?
      chunks.push(chunk);
    }).on('end', function() {
      var obj;
      try {
        obj = JSON.parse(chunks.join(''));
      }
      catch (e) {
        console.log('Failed parsing json');
        cb(false);
        return;
      }

      console.log(('results_per_page' in obj));
      console.log(predicate(obj));

      // Test if polling is complete
      if (predicate(obj)) {
        console.log('write on ' + data.event);
        cb(true, obj);
      }
      else {
        console.log('suppressing response due to no predicate match');
      }
    });
  }).on('error', function(e){
    console.log("Got error: " + e.message);
  }); // end http get
} // end everyone.now.get

server.use(express.static(__dirname + '/client'));

server.listen(8080);
