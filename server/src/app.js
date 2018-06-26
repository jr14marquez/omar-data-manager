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
const order_dict = {}
const fUtil = require('./lib/FileUtil.js')

const options = Object.assign(config.postgres,config.jobQueue)

let boss;
try {
  boss = new PgBoss(options)
}
catch(error){
  console.error(error)
}

console.log("UI LISTENING ON: ",config.node.ui)
server.listen(config.node.ui)
app.get('/',function(req,res){
  res.send('Health/Ingest UI coming soon...')
})

io.on('connection', function(socket){
  console.log('a user connected');
  //setInterval(() => {
    console.log('Emitting order_queue to connected clients')
    io.emit('ORDER_QUEUE', order_dict);
    io.emit('MONITORED_DIRECTORIES',config.watcher.directories)
  //},10000)
});

boss.on('error', onError);
boss.on('monitor-states', onMonitor);
 
// Basic usage of democracy to manage leader and citizen nodes.
console.log("CITIZEN NODE STARTED ON: ",config.node.address)
var dem = new Democracy({
  source: config.node.address,
  peers: config.node.peers,
  id: config.node.address
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
dem.on('completed', (data) => {
  delete order_dict[data.completed_id]
  io.emit('ORDER_QUEUE', order_dict);

});

dem.on('received', (data) => {
  let received_list = []
  data.received.map(jobId => {
    order_dict[JobId].client = data.hostname
    received_list.push(order_dict[JobId])
  })
  io.emit('ORDER_QUEUE', order_dict);
  io.emit('INGEST_QUEUE',received_list)
});

// move this to channels: [] in democracy later
dem.subscribe('completed');
dem.subscribe('received');
 
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

  console.log("Grabbing jobs that are already in the queue and bringing them in local for tracking/reporting.")
  const query = "SELECT id, priority, data->'file' AS file, data->'stats' AS Stats FROM job WHERE state = 'created' AND name = 'ingest'";
  boss.db.executeSql(query)
 .then((data) => {
    data.rows.map(res => {
      const file_name = path.basename(res.file)
      const job_data = {
        filename: file_name,
        size: filesize(res.stats.size),
        created: res.stats.ctime,
        priority: res.priority,
        file_type: res.stats.file_type,
        mission: res.stats.mission,
        directory: res.stats.directory,
        client: '',
      } 
      order_dict[res.id] = job_data
      io.emit('ORDER_QUEUE', order_dict);

    })    
  })

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
    console.log("FILE FROM WATCH: ",file)
    let base_path = path.dirname(file)
    const file_name = path.basename(file)
    stats.file_type = path.extname(file)
    stats.mission = fUtil.getMission(file_name)
    stats.directory = base_path

    // Get priority from config using the directory as key
    let priority = config.watcher.directories[base_path].priority
    console.log(`watcher found : ${file} with priority ${priority}`);
    // queue, {data}, {priority}, singletonKey
    boss.publishOnce('ingest', {file: file, stats: stats},{priority: priority},file)
      .then(jobId => {
        console.log(`created ingest-job ${jobId} for file: ${file}`)
        
        //Add to boss's order_dict report
        const job_data = {
          filename: file_name,
          size: filesize(stats.size),
          created: stats.ctime,
          priority: priority,
          file_type: stats.file_type,
          mission: stats.mission,
          directory: stats.directory,
          client: ''
        } 
        // Update UI with new order_dict download list 
        order_dict[jobId] = job_data
        io.emit('ORDER_QUEUE', order_dict);
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

