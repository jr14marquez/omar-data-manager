const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const path = require('path')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')
const PgBoss = require('pg-boss');
const boss = new PgBoss('postgres://postgres:postgres@localhost/o2-queue');

console.log("MY CONFIG: ",config);
 
const app = express()
app.use(morgan('dev'))
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
    console.log("i am not the leader so i'll subscribe to the ingest queue");
    boss.start()
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
  boss.disconnect()
  .then(() => console.log("Disconnected"))
  .catch(onError); //disconnect just incase i use to be a node designated to ingesting jobs
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

