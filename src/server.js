const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
var app = express()
app.use(bodyParser.json())
app.use(cors())
const { Pool } = require('pg')
//app.use(express.static(path.join(__dirname, '../dist')))
var server = require('http').Server(app);
var io = require('socket.io')(server);
const config = require('./config/config.js')

console.log("UI LISTENING ON: ",config.node.ui)
server.listen(config.node.ui)

const pool = new Pool({
  user: config.postgres.user,
  host: config.postgres.host,
  database: config.postgres.database,
  password: config.postgres.password
})

// the pool with emit an error on behalf of any idle clients
// it contains if a backend error or network partition happens
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err)
  process.exit(-1)
})



io.on('connection', function(socket){
  console.log('a user connected');
});

app.get('/', (req, res) => {
  pool.query("SELECT id, priority, data->'file' AS file, data->'stats' AS Stats FROM job WHERE name = 'ingest' AND state = 'created'")
  .then(result => { 
    console.log('test:', result.rows[0])
    res.send('Hello World!')
  })
  .catch(e => setImmediate(() => { throw e }))
 
})


  
  //const query = "SELECT id, priority, data->'file' AS file, data->'stats' AS Stats FROM job WHERE name = 'ingest' AND state = 'created'";
  

