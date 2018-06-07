const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')
const PgBoss = require('pg-boss');
const boss = new PgBoss(`postgres://${config.postgres.username}:${config.postgres.password}@${config.postgres.host}/${config.postgres.db_name}`);

//console.log("MY CONFIG: ",config);
 
const app = express()
app.use(bodyParser.json())
app.use(cors())

boss.on('error', onError);
 
// Basic usage of democracy to manage leader and citizen nodes.
var dem = new Democracy({
  source: config.node.address,
  peers: config.node.peers,
});
 
dem.on('added', (data) => {
  console.log('Added peer to rotation: ', data);
  if(!dem.isLeader()){
    console.log("i am not the leader so i'll connect and subscribe to the ingest queue");
    boss.connect()
      .then(boss => {
        boss.subscribe('ingest', ingestHandler)
          .then(() => console.log('subscribed to ingest queue'))
          .catch(onError);
    });

  }
});
 
dem.on('removed', (data) => {
  console.log('Removed peer from rotation: ', data);
});
 
dem.on('elected', (data) => {
  // Express stuff
  console.log('You have been elected leader! UI running on 8080');
  app.listen(8080)
  app.get('/',function(req,res){
    res.send('Health/Ingest UI coming soon...')
  })

  //Db queue
  // Disconnect just incase a node use to be a citizen/worker node
  boss.disconnect()
    .then(() => console.log("Disconnected"))
    .catch(onError); 
  boss.start()
    .then(ready)
    .catch(onError);

});
 
function ready() {


  console.log("INGEST o2-queue ready so we start the watcher...");
  var watcher = chokidar.watch(config.watcher.directories, config.watcher.options)
  watcher.on('addDir', (path,stats) => {
    console.log("Watching directory for files: ",path); 
  })

  watcher.on('add', (path, stats) => {
    console.log("added : ",path);
    boss.publish('ingest', {param1: 'parameter1'})
      .then(jobId => console.log(`created ingest-job ${jobId}`))
      .catch(onError);

  });

  // Subscribe to ingest queue and do work if leader is also a citizen
  if(config.node.citizen){
    boss.subscribe('ingest', ingestHandler)
      .then(() => console.log('leader subscribed to ingest queue'))
      .catch(onError);
  }
  
}
 
function ingestHandler(job) {
  console.log(`received ${job.name} ${job.id}`);
  console.log(`data: ${JSON.stringify(job.data)}`);
 
  job.done()
    .then(() => console.log(`some-job ${job.id} completed`))
    .catch(onError);
}
 
function onError(error) {
  console.error(error);
}
