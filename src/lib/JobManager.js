const fs = require('fs-extra')
const config = require('../config/config.js')

 
exports.ingest = (jobs,dem) => {
	console.log("JOBS IN INGEST: ",jobs)
	//REPORT back number of ingest jobs received.
	dem.publish('status', {received: jobs.length})
 
	jobs.map((job) => {
      mvFile(job.data.file)
      .then(() => {
      	//Run omar-data-manager cmdl app to ingest imagery
      	job.done()
        .then(() => {
        	console.log("JOB here: ",job)
        	console.log(`ingest-job ${job.id} completed`)
        	dem.publish('status', {completed_id: job.id});
        })
        .catch(onError)
      })     
    })
}

var mvFile = (image_file) => {
	let file_name = image_file.split("/").pop()
	var drop_dir = getFilePath(file_name, config.archive_dir)
	return fs.ensureDir(drop_dir)
		.then(() => {
			let dest = `${drop_dir}/${file_name}`
			return fs.move(image_file,dest)
				.then(() => {
				  return `successfully moved file to archive ${drop_dir}`
				})
				.catch(err => {
				  console.error(err)
				})
		})
		.catch(err => {
		  console.error(err)
		})
}

var getFilePath = (file_name, archive_dir) => {
	let mission = file_name.substring(7,11)
	mission = mission.indexOf("WV") < 0 ? `M${mission}` : 'WORLDVIEW'
	let year = file_name.substring(5,7)
	let mon = file_name.substring(2,5)
	let day = file_name.substring(0,2)
	let imageId = file_name.substring(0,18)
	let month = getMonth(file_name.substring(2,5))
	let filePath = `${archive_dir}/${mission}/${year}/${month}/${day}/${imageId}`

	return filePath
}

var getMonth = (month) => {
  return {
    'JAN': '01',
    'FEB': '02',
    'MAR': '03',
    'APR': '04',
    'MAY': '05',
    'JUN': '06',
    'JUL': '07',
    'AUG': '08',
    'SEP': '09',
    'OCT': '10',
    'NOV': '11',
    'DEC': '12'
  }[month];
}

var onError = (error) => {
  return(console.error(error));
}