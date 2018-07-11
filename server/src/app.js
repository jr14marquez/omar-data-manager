const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
var app = express()
app.use(bodyParser.json())
app.use(cors())
app.use(express.static(path.join(__dirname, '../dist')))
var server = require('http').Server(app);
var io = require('socket.io')(server);
const filesize = require('filesize')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')
const PgBoss = require('pg-boss');
const jm = require('./lib/JobManager.js')
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

console.log("UI LISTENING ON: ",config.node.ui)
server.listen(config.node.ui)
//app.get('/env',function(req,res){
 // res.send('Send env to app')
//})

io.on('connection', function(socket){
  console.log('a user connected');
    console.log('Emitting order_queue to connected clients')
    io.emit('CLIENT_STATUS',clientStatus())
    io.emit('ORDER_QUEUE', dem.order_dict);
    io.emit('MONITORED_DIRECTORIES',config.watcher.directories)
    console.log('client status on connecting: ', clientStatus()) 
});


// Basic usage of democracy to manage leader and citizen nodes.
console.log(`NODE STARTED ON: ${config.node.address} with peers ${config.node.peers}`)
var dem = new Democracy({
  source: config.node.address,
  peers: config.node.peers,
  id: config.node.address,
  channels: ['completed','received','ordered',config.node.address],
});
dem.order_dict = {}
dem.client_dict = {}
 
dem.on('elected', (data) => {
  console.log('You have been elected leader!');
  // Add leader to client_dict if not already present
  console.log('client dict in elected: ',dem.client_dict)

  if(!dem.client_dict.hasOwnProperty(data.id)) {
    if(config.node.citizen){
      dem.client_dict[data.id] = { jobs: {}, active: true}
    } else {
      // might have to unsubscribe
      dem.client_dict[data.id] = { jobs: {}, active: false}
    }
  }
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
    dem.client_dict[data.id] =  { jobs: {}, active: true } //Add peer
  } 
  else {
    console.log('I have just joined the rotation so i subscribe and get to work.')
    boss.connect()
      .then(boss => {
        dem.client_dict = data.client_dict
        dem.order_dict = data.order_dict // Get order dictionary from master for new node
        console.log('connected so now we need to subscribe')
        boss.subscribe('ingest', {batchSize: 5 }, job => {
            jm.ingest(job,dem,io)
          })
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
    dem.client_dict[data.id] = { jobs: {}, active: true } //Add peer 
    io.emit('CLIENT_STATUS', clientStatus())
    console.log('order dict in join: ', Object.keys(dem.order_dict).length)
    dem.send('joined',{ id: data.id, client_dict: dem.client_dict, order_dict: dem.order_dict })
  }
})

dem.on('removed', (data) => {
  console.log('Removed peer from rotation: ', data.id);
  dem.client_dict[data.id].active = false
  io.emit('CLIENT_STATUS',clientStatus())
});



// Fired from the master when boss.onCompleted is fired.
// This is received by citizen nodes and sent to their UI.
dem.on('completed', (data) => {
  dem.order_dict = data.orderDict
  dem.client_dict = data.clientDict
  io.emit('ORDER_QUEUE', dem.order_dict);
  io.emit('INGEST_QUEUE', dem.client_dict); 
})

/* Loop over list of jobId's and look them up in the
** order dictionary to set the hostname of client citizen
** working on the job. 
**/
dem.on('received', (data) => {
  console.log(`${data.hostname} recieved ${data.received.length} jobs sending out status to my ui.`)
  data.received.map(jobId => {
    dem.client_dict[data.hostname].jobs[jobId] = dem.order_dict[jobId]
  })
  io.emit('INGEST_QUEUE', dem.client_dict);
});

dem.on('ordered', (data) => {
  dem.order_dict = data
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
      dem.order_dict[res.id] = job_data
      dem.publish('ordered', dem.order_dict)
      io.emit('ORDER_QUEUE', dem.order_dict);

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
        dem.order_dict[jobId] = job_data
        dem.publish('ordered', dem.order_dict)
        io.emit('ORDER_QUEUE', dem.order_dict);
      })
      .catch(onError);
   });

  // Subscribe to ingest queue, add myself to client_dict for job tracking
  // and do work if leader is also a citizen
  if(config.node.citizen){
    dem.client_dict[dem.options.id] = { jobs: {}, active: true}
    boss.subscribe('ingest', {batchSize: 5 }, job => { jm.ingest(job,dem,io)})
      .then(() => {
        console.log('leader subscribed to ingest queue')
        console.log('client status in joined: ', clientStatus())
        io.emit('CLIENT_STATUS', clientStatus())
      })
      .catch(onError);
  } 

  boss.onComplete('ingest', job => {
    if(job.data.failed) {
      return console.error(`job ${job.data.request.id} ${job.data.state}`);
    }

    console.log(`Master marking job: ${job.data.request.id} completed by ${job.data.response.value}`)
    delete dem.order_dict[job.data.request.id]
    delete dem.client_dict[job.data.response.value].jobs[job.data.request.id]
    dem.publish('completed', { orderDict: dem.order_dict, clientDict: dem.client_dict })
    io.emit('ORDER_QUEUE', dem.order_dict);
    io.emit('INGEST_QUEUE', dem.client_dict); 
  })
  .then(() => console.log(`subscribed to queue ingest completions`));
}

function clientStatus() {
  var clients = { active: [], removed: [] }
  Object.keys(dem.client_dict).map(client => {
    if(dem.client_dict[client].active == true){
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


