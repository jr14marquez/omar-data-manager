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
var order_dict = {}
var client_dict = {}
const fUtil = require('./lib/FileUtil.js')

const options = Object.assign(config.postgres,config.jobQueue)

let boss;
try {
  boss = new PgBoss(options)
}
catch(error){
  console.error(error)
}

boss.on('error', onError);
boss.on('monitor-states', onMonitor);

console.log("UI LISTENING ON: ",config.node.ui)
server.listen(config.node.ui)
app.get('/',function(req,res){
  res.send('Health/Ingest UI coming soon...')
})

io.on('connection', function(socket){
  console.log('a user connected');
    console.log('Emitting order_queue to connected clients')
    io.emit('CLIENT_STATUS',clientStatus())
    io.emit('ORDER_QUEUE', order_dict);
    io.emit('MONITORED_DIRECTORIES',config.watcher.directories)
    console.log('client status on connectiong: ', clientStatus()) 
});


// Basic usage of democracy to manage leader and citizen nodes.
console.log("NODE STARTED ON: ",config.node.address)
var dem = new Democracy({
  source: config.node.address,
  peers: config.node.peers,
  id: config.node.address,
  channels: ['completed','received','ordered'],
});
 
dem.options.test3 = 'hello3'

dem.on('elected', (data) => {
  console.log('You have been elected leader!');
  boss.start()
    .then(ready)
    .catch(onError);

});

/* This event is fired on all nodes. Only the new node
** will wait for the leader to be added to his rotation
** before firing off the join event to all the others.
*/
dem.on('added', (data) => {
  if(data.state == 'leader') {
    dem.send('join',{ id: dem.options.id })
  }
});


dem.on('joined', (data) => {
  // Add peer to others 
  if(dem.options.id != data.id){
    // client_dict[data.id] =  { jobs: [], active: true } //Add peer
    client_dict[data.id] =  { jobs: {}, active: true } //Add peer
  } 
  else {
    console.log('I have just joined the rotation so i subscribe and get to work.')
    boss.connect()
      .then(boss => {
        client_dict = data.client_dict
        order_dict = data.order_dict // Get order dictionary from master for new node
        console.log('connected so now we need to subscribe')
        boss.subscribe('ingest', {batchSize: 5 }, job => jm.ingest(job,dem))
          .then(() => { 
            console.log('subscribed to ingest queue')
            console.log('client status in joined: ', clientStatus())
            io.emit('CLIENT_STATUS', clientStatus())
            
          })
          .catch(onError);
      })
      .catch(onError);
  }
})

dem.on('join', (data) => {
  if(dem.isLeader()){
    // client_dict[data.id] = { jobs: [], active: true } //Add peer 
    client_dict[data.id] = { jobs: {}, active: true } //Add peer 
    io.emit('CLIENT_STATUS', clientStatus())
    dem.send('joined',{ id: data.id, client_dict: client_dict, order_dict: order_dict })
  }
})

dem.on('removed', (data) => {
  console.log('Removed peer from rotation: ', data.id);
  client_dict[data.id].active = false
  io.emit('CLIENT_STATUS',clientStatus())
});



// Each citizen will report status on jobs here
// which will then be sent to the ui via socketio
dem.on('completed', (data) => {
  delete order_dict[data.completed_id]
  delete client_dict[data.hostname].jobs[data.completed_id]
  io.emit('ORDER_QUEUE', order_dict);
  io.emit('INGEST_QUEUE', client_dict);
})

dem.on('received', (data) => {
  console.log('received jobs... sending out status')
 
  /* Loop over list of jobId's and look them up in the
  ** order dictionary to set the hostname of client citizen
  ** working on the job. Once this is done it checks to see
  ** if the jobs proprerty is set for that client. If its the 
  ** clients first job then it creates the job property and pushes
  ** the jobs into the client dictionary
  **/
  data.received.map(jobId => {
    //if(client_dict[data.hostname].hasOwnProperty('jobs')) {
      // client_dict[data.hostname].jobs.push(order_dict[jobId])
      client_dict[data.hostname].jobs[jobId] = order_dict[jobId]
    //}
  })
  io.emit('INGEST_QUEUE', client_dict);
});

dem.on('ordered', (data) => {
  order_dict = data
})


  
function ready() {

  console.log("Grabbing jobs that are already in the queue and bringing them in local for tracking/reporting.")
  const query = "SELECT id, priority, data->'file' AS file, data->'stats' AS Stats FROM job WHERE name = 'ingest' AND state = 'created'";
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
      dem.publish('ordered', order_dict)
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
        dem.publish('ordered', order_dict)
        io.emit('ORDER_QUEUE', order_dict);
      })
      .catch(onError);
   });

  // Subscribe to ingest queue, add myself to client_dict for job tracking
  // and do work if leader is also a citizen
  if(config.node.citizen){
    // client_dict[dem.options.id] = { jobs: [], active: true}
    client_dict[dem.options.id] = { jobs: {}, active: true}
    boss.subscribe('ingest', {batchSize: 5 }, job => jm.ingest(job))
      .then(() => console.log('leader subscribed to ingest queue'))
      .catch(onError);
  }
  
}

function clientStatus() {
  var clients = { active: [], removed: [] }
  Object.keys(client_dict).map(client => {
    if(client_dict[client].active == true){
      clients.active.push(client)
    } 
    else {
      clients.removed.push(client)
    }
  })

  return clients
}


 
function onError(error) {
  console.error(error);
}

function onMonitor(data){
  //console.log("IN ON MONITOR with DATA: ",data)
  //console.log("BOSS: ",boss)
}

