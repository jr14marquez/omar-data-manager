const path = require('path')
const os = require('os')
const filesize = require('filesize')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')
const PgBoss = require('pg-boss');
const jm = require('./lib/JobManager.js')
const fUtil = require('./lib/FileUtil.js')
const log = require('./lib/Logger.js')
const options = Object.assign(config.postgres,config.jobQueue)
var queues = { 'ingest': false }

let boss;
try {
  boss = new PgBoss(options)
}
catch(error){
  console.error(error)
}

boss.on('error', onError)
boss.on('expired', onExpired)

log.info(`NODE STARTED ON: ${os.hostname}:3000 with peers ${config.node.peers}`)
// Basic usage of democracy to manage leader and citizen nodes.
var dem = new Democracy({
  timeout: 30000,
  source: `${os.hostname}:3000`,
  peers: config.node.peers,
  id: `${os.hostname}:3000`,
  channels: ['completed','received','ordered','joined'],
})

dem.on('elected', (data) => {
  log.info('You have been elected leader!')
  boss.start()
    .then(ready)
    .catch(onError);
})

/* This event is fired on all nodes. Only the new node
** will wait for the leader to be added to his rotation
** before firing off the join event to all the others.
*/
dem.on('added', (data) => {
  log.info(`Added peer to rotation: ${data.id}`)
  if(data.state == 'leader') {
    if(queues['ingest'] == false){
      queues['ingest'] = true
      log.info('I have just joined the rotation so i subscribe and start working.')
      boss.connect()
        .then(boss => {
          log.info('connected so now i need attempting to subscribe.')
          boss.subscribe('ingest', { batchSize: 10, newJobCheckIntervalSeconds: 20 }, job => { jm.ingest(job,dem) })
            .then(() => {
              log.info('subscribed to ingest queue')
            })
            .catch(onError)
        })
        .catch(onError)
    }
  }
})

dem.on('removed', (data) => {
  log.warning(`Removed peer from rotation: ${data.id}`)
})
 
function ready() {

  log.info('INGEST o2-queue ready so we start the watcher...')
  let watch_dirs = []
  let directories = Object.keys(config.watcher.directories)
  directories.map(dir => {
    config.watcher.directories[dir].extensions.map(ext => {
      let directory = `${config.watcher.directories[dir].path}/${ext}`
      watch_dirs.push(directory)
    })
  })

  var watcher = chokidar.watch(watch_dirs, config.watcher.options)
  watcher.on('add', (file, stats) => {
    const base_path = path.dirname(file)
    const file_name = path.basename(file)
    stats.file_type = path.extname(file)
    stats.mission = fUtil.getMission(file_name)
    stats.directory = base_path

    var priority = '1'
    Object.keys(config.watcher.directories).map(dir => {
      if(config.watcher.directories[dir].path === base_path) {
        priority = config.watcher.directories[dir].priority
      }
    })
    
    boss.publishOnce('ingest', {file: file, stats: stats},{priority: priority, expireIn: '720 minutes'},file)
      .then(jobId => {
        if(jobId != null) {
          log.info(`created ingestjob ${jobId} for file: ${file} with priority ${priority}`)
        }
        else {
          log.warning(`Image ${file} already exists`)
        }
      })
      .catch(onError)
  })//end watcher
        
  if(config.node.citizen){
    if(queues['ingest'] == false) {
      boss.subscribe('ingest', {batchSize: 10, newJobCheckIntervalSeconds 20 }, job => { jm.ingest(job,dem)})
        .then(() => {
          log.info('leader subscribed to ingest queue')
        })
        .catch(onError)
    }
  } 

  boss.onComplete('ingest', job => {
    if(job.data.failed) {
      return log.error(`job ${job.data.request.id} ${job.data.state}`)
    }
  })
  .then(() => log.info('subscribed to ingest queue completions')
    
}//end ready

function onError(error) {
  log.error(error)
}

function onExpired(expired) {
  log.warning(`Expired: ${expired}`)
}


