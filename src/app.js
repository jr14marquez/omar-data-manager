const express = require('express')
const fs = require('fs')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')
const PgBoss = require('pg-boss');
const jm = require('./lib/JobManager.js')
const awaiting = {}; //Empty Map

const options = {
  host: config.postgres.host,
  database: config.postgres.db_name,
  user: config.postgres.username,
  password: config.postgres.password,
  expireCheckIntervalMinutes: 2,
  archiveCompletedJobsEvery: '1 hour',
  archiveCheckIntervalMinutes: 20,
  deleteArchivedJobsEvery: '7 days',
  deleteCheckInterval: '',
  monitorStateIntervalSeconds: 1,
}

let boss;
try {
  boss = new PgBoss(options)
}
catch(error){
  console.error(error)
}

const app = express()
app.use(bodyParser.json())
app.use(cors())

boss.on('error', onError);
boss.on('monitor-states', onMonitor);
 
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
        boss.subscribe('ingest', {batchSize: 5 }, job => jm.ingest(job))
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
  console.log("DATA: ",data)
  app.listen(8080)
  app.get('/',function(req,res){
    //res.send('Health/Ingest UI coming soon...')
    console.log("AWAITING IN / :",awaiting)
    res.send(awaiting)
  })

  boss.start()
    .then(ready)
    .catch(onError);

});
 
function ready() {


  console.log("INGEST o2-queue ready so we start the watcher...");
  var watcher = chokidar.watch(config.watcher.directories, config.watcher.options)

  watcher.on('add', (path, stats) => {
    console.log("watcher found : ",path);
    // {priority: 1}
    boss.publishOnce('ingest', {file: path, stats: stats})
      .then(jobId => {
        console.log(`created ingest-job ${jobId} for file: ${path}`)
        awaiting[jobId] = path
        console.log("AWAITING: ",awaiting)
      })
      .catch(onError);

  });

  // Subscribe to ingest queue and do work if leader is also a citizen
  if(config.node.citizen){
    boss.subscribe('ingest', {batchSize: 5 }, job => jm.ingest(job))
      .then(() => console.log('leader subscribed to ingest queue'))
      .catch(onError);
  }
  
}
 
function onError(error) {
  console.error(error);
}

function onMonitor(data){
  //console.log("IN ON MONITOR with DATA: ",data)
  //console.log("BOSS: ",boss)
}

