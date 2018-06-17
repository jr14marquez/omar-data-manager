const fs = require('fs-extra')
const config = require('../config/config.js')

 
exports.ingest = (jobs) => {
	console.log("JOBS IN INGEST: ",jobs)
	jobs.map((job) => {
      mvFile(job.data.file)
      .then(() => {
      	job.done()
        .then(() => console.log(`ingest-job ${job.id} completed`))
        .catch(onError)
      })     
    })
}

function wait(arg){
	console.log("ARG here: ",arg)
}

var mvFile = (image_file) => {
	//console.log("IMAGE FILE: ",image_file)
	//console.log("ARCHIVE_DIR: ",config.archive_dir)
	let file_name = image_file.split("/").pop()
	var drop_dir = getFilePath(file_name, config.archive_dir)
	//console.log("DROP DIR: ",drop_dir)
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