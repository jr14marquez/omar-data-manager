const fs = require('fs-extra')
const fUtil = require('./FileUtil.js')
const config = require('../config/config.js')
const logger = require('./Logger.js')
const axios = require('axios')

exports.ingest = (jobs,dem) => {
  logger.log('info',`Starting ingest with ${jobs.length}`)

  /*jobs.map((job) => {
    console.log('in first job loop for pending')
    logger.log('info',{ 
      status: 'pending', 
      jobId: job.id, 
      fileName: job.data.stats.fileName, 
      fileType: job.data.stats.fileType,
      directory: job.data.stats.directory,
      mission: job.data.stats.mission,
      priority: job.data.stats.priority, 
      message: `Pending ingest job ${job.id} for file: ${job.data.file} with priority ${job.data.stats.priority}`
    })
  })*/
  console.log('after loop')

	jobs.map((job) => {
    const args = `-u ${config.stager_url} --preproc --ot ossim_kakadu_nitf_j2k --ch add`.split(" ")
    logger.log({ 
      level: 'info',
      status: 'active', 
      jobId: job.id, 
      fileName: job.data.stats.fileName, 
      fileType: job.data.stats.fileType,
      directory: job.data.stats.directory,
      mission: job.data.stats.mission,
      priority: job.data.stats.priority, 
      message: `Working on ingest job ${job.id} for file: ${job.data.file} with priority ${job.data.stats.priority}`
    })

      var destDir = fUtil.getFilePath(job.data.stats.fileName, config.archive_dir)
      var destination = `${destDir}/${job.data.stats.fileName}`
      // creates destination/file tree also
    fUtil.mvToDestination(job.data.file,destDir,destination)
      .then(() => {
        console.log('after mvToDestination')
        // Archive directory has been built; Run omar-data-manager cmdl app to ingest imagery

        return axios.post(`${config.stager_url}/dataManager/addRaster`, {
          "filename": destination,
          "overviewType": "ossim_kakadu_nitf_j2k"
        })
      })
      .then((res) => {
        console.log('res: ',res)
        console.log(`statusCode: ${res.status}`) //200 if successful
        console.log('res data: ',res.data)
        if(res.status == 200){
          // res.data = 'Added raster 30:/home/rmarquez/Downloads/11JUL29082314-P1BS-057338893010_01_P002.NTF' when successful
          logger.log('info',res.data)
          job.done(null,dem.options.id)
        }
      })
      .catch((error) => {
        // error = dest already exists. when mvToDestination destination already exists (full path to file)
        console.log('err from post request to stager or from fUtil ingestFile: ',error)
        job.done(error,dem.options.id)
      })
  })
}


var onError = (error) => {
  var msg = logger.log('error',error)
  return msg
}
