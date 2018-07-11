const fs = require('fs-extra')
const fUtil = require('./FileUtil.js')
const config = require('../config/config.js')
const { execFile } = require('child_process')

const cmd = `omar-data-mgr -u ${config.stager_url} --preproc --ot ossim_kakadu_nitf_j2k --ch add `

exports.ingest = (jobs,dem,io) => {
  console.log('in ingest')
  let job_ids = []
  jobs.map((job) => { 
    job_ids.push(job.id)
    dem.client_dict[dem.options.id].jobs[job.id] = dem.order_dict[job.id]
  })
  //REPORT back number of ingest jobs received.
  dem.publish('received', { hostname: dem.options.id, received: job_ids})
  io.emit('INGEST_QUEUE', dem.client_dict);
	jobs.map((job) => {
    
    fUtil.ingestFile(job.data.file,config.archive_dir)
      .then(() => {
        // Archive directory has been built; Run omar-data-manager cmdl app to ingest imagery
        const ingestPs = execFile(cmd, function(error, stdout,stderr) {
          if(error){
            //move file to failed and throw error in done
            fUtil.mvFile(job.data.file,config.failed_dir)
              .then(() => {
                var err = new Error('Failed to ingest image')
                job.done(err,dem.options.id)
              })
              .catch(onError)
          }

          var regexSuccess = /Added raster/;

          if(regexSuccess.test(stdout)) {
            job.done(null,dem.options.id)
            console.log(`completed job ${job.id}`)
          }
        })
      })
      .catch(onError)
  })
}


var onError = (error) => {
  return(console.error(error));
}