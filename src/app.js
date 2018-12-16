const path = require('path')
const os = require('os')
const filesize = require('filesize')
const Democracy = require('democracy');
const chokidar = require('chokidar');
const config = require('./config/config.js')
const PgBoss = require('pg-boss');
const jm = require('./lib/JobManager.js')
const fUtil = require('./lib/FileUtil.js')
const logger = require('./lib/Logger')
const options = Object.assign(config.postgres,config.jobQueue)
var queues = { 'ingest': false }

//var apm = require('elastic-apm-node').start()

let boss;
try {
  boss = new PgBoss(options)
}
catch(error){
  logger.log('error',error)
}

boss.on('error', onError)
boss.on('expired', onExpired)

logger.log('info',`NODE STARTED ON: ${os.hostname}:3000 with configured peers ${config.node.peers}`)
// Basic usage of democracy to manage leader and citizen nodes.
var dem = new Democracy({
  timeout: 30000,
  source: `${os.hostname}:3000`,
  peers: config.node.peers,
  id: `${os.hostname}:3000`
})

dem.on('elected', (data) => {
  logger.log('info',`${os.hostname}:3000 has been elected leader!`)
  boss.start()
    .then(ready)
    .catch(onError);
})

/* This event is fired on all nodes. Only the new node
** will wait for the leader to be added to his rotation
** before firing off the join event to all the others.
*/
dem.on('added', (data) => {
  logger.log('info',`Added peer to rotation: ${data.id}`)
  if(data.state == 'leader') {
    if(queues['ingest'] == false){
      queues['ingest'] = true
      logger.log('info','I have just joined the rotation so i subscribe and start working.')
      boss.connect()
        .then(boss => {
          logger.log('info','connected so now i need attempting to subscribe.')
          boss.subscribe('ingest', { batchSize: 10, newJobCheckIntervalSeconds: 20 }, job => { jm.ingest(job,dem) })
            .then(() => {
              logger.log('info','subscribed to ingest queue')
            })
            .catch(onError)
        })
        .catch(onError)
    }
  }
})

dem.on('removed', (data) => {
  logger.log('warn',`Removed peer from rotation: ${data.id}`)
})
 
function ready() {

  logger.log('info',`INGEST o2-queue ready. ${os.hostname}:3000 starting the watcher...`)
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
    stats.fileName = path.basename(file)
    stats.fileType = path.extname(file)
    stats.mission = fUtil.getMission(stats.fileName)
    stats.directory = base_path
    stats.priority = 1

    Object.keys(config.watcher.directories).map(dir => {
      if(config.watcher.directories[dir].path === base_path) {
        stats.priority = config.watcher.directories[dir].priority
      }
    })
    
    boss.publishOnce('ingest', {file: file, stats: stats},{priority: stats.priority, expireIn: '720 minutes'},file)
      .then(jobId => {
        if(jobId != null) {
          logger.info({ 
            status: 'created', 
            jobId: jobId, 
            fileName: stats.fileName, 
            fileType: stats.fileType,
            directory: stats.directory,
            mission: stats.mission,
            priority: stats.priority, 
            message: `Created ingest job ${jobId} for file: ${file} with priority ${stats.priority}`
          })
        }
        else {
          //TODO: Probably need to move this file or retry once?
          logger.log('warn',`Image ${file} already has been ingested. Clear job queue/image from job queue or rename file.`)
        }
      })
      .catch(onError)
  })//end watcher
        
  if(config.node.citizen){
    if(queues['ingest'] == false) {
      boss.subscribe('ingest', {batchSize: 10, newJobCheckIntervalSeconds: 20 }, job => { jm.ingest(job,dem)})
        .then(() => {
          logger.log('info',`${os.hostname}:3000 leader subscribed to ingest queue`)
        })
        .catch(onError)
    }
  } 

  boss.onComplete('ingest', job => {
    var level = job.data.state != 'failed' ? 'info' : 'error'
    var completedMsg = `Completed ingest job ${job.data.request.id} for file: ${job.data.request.data.file} with priority ${job.data.request.data.stats.priority}`
    var msg = level == 'info' ? completedMsg : `File: ${job.data.request.data.file} failed with ${job.data.response.message}`
    
    logger.log({ 
      level: level,
      status: job.data.state, 
      jobId: job.data.request.id, 
      fileName: job.data.request.data.stats.fileName, 
      fileType: job.data.request.data.stats.fileType,
      directory: job.data.request.data.stats.directory,
      mission: job.data.request.data.stats.mission,
      priority: job.data.request.data.stats.priority, 
      message: msg
    })
    if(job.data.failed) {
      var destDir = fUtil.getFilePath(job.data.request.data.stats.fileName, config.archive_dir)
      var destination = `${destDir}/${job.data.request.data.stats.fileName}`
      var rgx = /exists/;
   
      // should probably include a config option to let them decide to move to failed or keep in archive 
      // should probably include a config option to allow them to delete/keep a file if it already exists
      var failedImg = rgx.test(job.data.response.message) ? `${job.data.request.data.stats.directory}/${job.data.request.data.stats.fileName}` : destination
      fUtil.mvFile(failedImg,config.failed_dir)
      .catch(onError)

    } // end if failed
  })
  .then(() => logger.log('info',`${os.hostname}:3000 leader subscribed to ingest queue completions to handle failed jobs`))
    
}//end ready

function onError(error) {
  logger.log('error',error)
}

function onExpired(expired) {
  logger.log('warn',`Expired: ${expired}`)
}


