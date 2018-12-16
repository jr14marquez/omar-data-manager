const fs = require('fs-extra')
const logger = require('./Logger.js')

var mvToDestination = (file,destDir,destination) => {
	return fs.ensureDir(destDir)
	  .then(() => {
			return fs.move(file,destination)
		})
}

var mvFile = (file,directory) => {
	let file_name = file.split('/').pop()
	return fs.ensureDir(directory)
		.then(() => {
			let dest = `${directory}/${file_name}`
			return fs.move(file,dest)
				.then(() => {
				  return { code: 'fail', destination: dest }
				})
				.catch(err => { logger.log('error',`Err in mvFile.fs move: ${err}`) })
		})
		.catch(err => { logger.log('error',`Err in mvFile.fs ensure: ${err}`) })
}

var getFilePath = (file_name, archive_dir) => {
	let mission = getMission(file_name)
	let year = getYear(file_name)
	let day = getDay(file_name)
	let imageId = getImageId(file_name)
	let month = getMonth(file_name)
	let filePath = `${archive_dir}/${mission}/${year}/${month}/${day}/${imageId}`

	return filePath
}

var getMission = (file_name) => {
	let mission = file_name.substring(7,11)
	mission = mission.indexOf("WV") < 0 ? `M${mission}` : 'WORLDVIEW'
	return mission
}

var getYear = (file_name) => { return file_name.substring(5,7) }

var getMonth = (file_name) => {
	let month = file_name.substring(2,5)
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

var getDay = (file_name) => { return file_name.substring(0,2) }

var getImageId = (file_name) => { return file_name.substring(0,18) }

module.exports = {
	mvToDestination: mvToDestination,
	mvFile: mvFile,
  getFilePath: getFilePath,
  getMission: getMission,
  getYear: getYear,
  getMonth: getMonth,
  getDay: getDay,
  getImageId: getImageId
}