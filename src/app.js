const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')

console.log("MY CONFIG: ",config);
console.log("PEERS: ",config.node.peers);
 
const app = express()
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cors())


 
// Basic usage of democracy to manager leader and citizen nodes.
var dem = new Democracy({
  source: config.node.address,
  peers: ['0.0.0.0:3000','0.0.0.0:3001','0.0.0.0:3002'],
});
 
dem.on('added', (data) => {
  console.log('Added peer to rotation: ', data);
});
 
dem.on('removed', (data) => {
  console.log('Removed peer from rotation: ', data);
});
 
dem.on('elected', (data) => {
  console.log('You have been elected leader! UI running on 8080');
  //console.log("DEM: ",dem);
  app.listen(8080)
  app.get('/',function(req,res){
    console.log("health ui coming soon...")
   //dem.send('ciao',{hello: 'blahblahblah'});
  })

  // One-liner for current directory, ignores .dotfiles
  var watch_options = {
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    },
    ignored: /(^|[\/\\])\../
  }
	var watcher = chokidar.watch('/home/rmarquez/temp', watch_options)
  watcher.on('addDir', (event,path) => {
    console.log("Watching directory for files: ",path);
  })

  watcher.on('add', (event, path) => {
  		console.log(event, path);
      // TODO: get worker node stats to see where to send added file
      // TODO: publish or send message

  });

});
 
// Support for custom events.
dem.on('ciao', (data) => {
  console.log(data.hello); // Logs 'world'
});
 
dem.send('ciao', {hello: 'world'});
 
// Support for basic pub/sub.
dem.on('my-channel', (data) => {
  console.log(data.hello); // Logs 'world'
});
 
dem.subscribe('my-channel');
dem.publish('my-channel', {hello: 'world'});


