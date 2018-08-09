const fs = require('fs-extra')
const fUtil = require('./FileUtil.js')
const config = require('../config/config.js')
const { execFile } = require('child_process')
const log = require('./Logger.js')

exports.ingest = (jobs,dem) => {
  log.info(`Starting ingest with ${jobs.length}`)
	jobs.map((job) => {
    const args = `-u ${config.stager_url} --preproc --ot ossim_kakadu_nitf_j2k --ch add`.split(" ")
    log.info(`Working on ingesting ${job.data.file}`)
    fUtil.ingestFile(job.data.file,config.archive_dir)
      .then((file) => {
        // Archive directory has been built; Run omar-data-manager cmdl app to ingest imagery
        var regexSuccess = /Added raster/;
        var regexExists = /already exists/; // Doesn't exist on filesystem but exists in db

        args.push(file.destination)
        const ingestPs = execFile('omar-data-manager', args, (error, stdout, stderr) => {
          console.log('stdout: ',stdout)
          if(error != null){
            onError(`Error: ${error}`)
            onError(`Error: ${error}`)
            if(regexExists.test(stdout)) {
              log.warning(`File already exists in database. Completed job ${job.id}`)
              job.done(null, dem.options.id)
            }
            else {
              onError(`Error: ${error}`)
              onError(`Error: ${error}`)
              //move file to failed and throw error in done
              fUtil.mvFile(file.destination,config.failed_dir)
                .then((file) => {
                  onError(`Finished moving to failed: ${file.destination}`)
                  var err = new Error('Failed to ingest image')
                  job.done(err,dem.options.id)
                })
                .catch(onError)
            }
          }

          if(regexSuccess.test(stdout)) {
            console.log('stdout': stdout)
            job.done(null,dem.options.id)
            log.success(`completed job ${job.id}`)
          }
        })
      })
      .catch(onError)
  })
}


var onError = (error) => {
  return(console.error(error));
}