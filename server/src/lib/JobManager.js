const fs = require('fs-extra')
const fUtil = require('./FileUtil.js')
const config = require('../config/config.js')

 
exports.ingest = (jobs,dem) => {
  let job_ids = []
  jobs.map((job) => { job_ids.push(job.id) })
  //REPORT back number of ingest jobs received.
  console.log('job ids : ', job_ids)
  dem.publish('received', { hostname: dem.options.id, received: job_ids})
	console.log('in ingest')
	jobs.map((job) => {

      // fUtil.mvFile(job.data.file,config.archive_dir)
      //   .then(() => {
      //   	//Run omar-data-manager cmdl app to ingest imagery
         	job.done()
           .then(() => {
          	console.log(`ingest-job ${job.id} completed`)
           	dem.publish('completed', {completed_id: job.id})
           })
           .catch(onError)
      //}) 
  })
}


var onError = (error) => {
  return(console.error(error));
}