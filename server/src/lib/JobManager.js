const fs = require('fs-extra')
const fUtil = require('./FileUtil.js')
const config = require('../config/config.js')

 
exports.ingest = (jobs,dem) => {
	console.log("JOBS IN INGEST FOR THIS NODE: ",jobs)
	//REPORT back number of ingest jobs received.
	dem.publish('status', {received: jobs.length})
 
	jobs.map((job) => {
      //mvFile(job.data.file)
      fUtil.mvFile(job.data.file,config.archive_dir)
      .then(() => {
      	//Run omar-data-manager cmdl app to ingest imagery
      	job.done()
        .then(() => {
        	console.log(`ingest-job ${job.id} completed`)
        	dem.publish('status', {completed_id: job.id});
        })
        .catch(onError)
      })     
    })
}


var onError = (error) => {
  return(console.error(error));
}