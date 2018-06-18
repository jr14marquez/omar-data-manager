const express = require('express')();
const bodyParser = require('body-parser')
const cors = require('cors')
express.use(bodyParser.json())
express.use(cors())

var app = require('express')();
app.use(bodyParser.json())
app.use(cors())
var server = require('http').Server(app);
var io = require('socket.io')(server);

const fs = require('fs')
const filesize = require('filesize')
const path = require('path')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')
const PgBoss = require('pg-boss');
const jm = require('./lib/JobManager.js')
const awaiting = {}


const options = {
  host: config.postgres.host,
  database: config.postgres.db_name,
  user: config.postgres.username,
  password: config.postgres.password,
  schema: 'public',
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


server.listen(config.node.ui)
app.get('/',function(req,res){
  res.send('Health/Ingest UI coming soon...')
})

io.on('connection', function(socket){
  console.log('a user connected');
});

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
        boss.subscribe('ingest', {batchSize: 5 }, job => jm.ingest(job,dem))
          .then(() => console.log('subscribed to ingest queue'))
          .catch(onError);

    });

  }
});

// Each citizen will report status on jobs here
// which will then be sent to the ui via socketio
dem.on('status', (data) => {
  console.log(data)
  console.log("AWAITING BEFORE: ",awaiting)
  delete awaiting[data.completed_id]
  console.log("AWAITING NOW: ",awaiting)

});

dem.subscribe('status');
 
dem.on('removed', (data) => {
  console.log('Removed peer from rotation: ', data);
});
 
dem.on('elected', (data) => {
  console.log('You have been elected leader!');
  boss.start()
    .then(ready)
    .catch(onError);

});
 
function ready() {

  console.log("INGEST o2-queue ready so we start the watcher...");

  let watch_dirs = []
  let directories = Object.keys(config.watcher.directories)
  directories.map(dir => {
    config.watcher.directories[dir].extensions.map(ext => {
      let directory = `${dir}/${ext}`
      watch_dirs.push(directory)
    })
  })

  console.log("WATCH DIRS: ",watch_dirs)
  var watcher = chokidar.watch(watch_dirs, config.watcher.options)
  watcher.on('add', (file, stats) => {
    let base_path = path.dirname(file)
    let priority = config.watcher.directories[base_path].priority
    console.log(`watcher found : ${file} with priority ${priority}`);
    // queue, {data}, {priority}, singletonKey
    boss.publishOnce('ingest', {file: file, stats: stats},{priority: priority},file)
      .then(jobId => {
        console.log(`created ingest-job ${jobId} for file: ${file}`)
        const file_name = path.basename(file);
        //Add to boss's awaiting report
        const job_data = {
          filename: file_name,
          size: filesize(stats.size),
          created: stats.ctime,
        } 
        awaiting[jobId] = job_data
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

