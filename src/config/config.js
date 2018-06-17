// config.js
require('dotenv').config();
const convict = require('convict');

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['prod', 'dev', 'test'],
    default: 'dev',
    arg: 'nodeEnv',
    env: 'NODE_ENV'
  },
  archive_dir: {
    doc: 'The path to the archive directory where data should be written to.',
    format: String,
    default: '/home/rmarquez/archive',
    env: 'ARCHIVE_DIR'
  },
  node: {
    /* By Default the first node started will be the leader node and each
     * node after will be a citizen. A vote will take place and a new 
     * leader will be elected if the leader server/app goes down.
     * Note: A leader can also be a citizen by setting the citizen flag
     * to true.
    */
    address: {
      doc: 'The IP/Port this node should be listening on.',
      format: '*',
      default: '0.0.0.0:3000',
      arg: 'address',
      env: 'ADDRESS'
    },
    citizen: {
      format: 'Boolean',
      default: false,
      env: 'CITIZEN',
    },
    peers: {
      doc: 'All nodes/peers in the system including itself',
      format: Array,
      default: ['0.0.0.0:3000','0.0.0.0:3001','0.0.0.0:3002'],
      env: 'PEERS',
    },
    ui: {
      doc: 'The port the Health/Status UI should listen/bind on',
      format: "port",
      default: 8080,
      arg: "ui",
      env: "UI"
    }
  },
  watcher: {
    // chokidar options ignoring hidden . files
    options: {
      doc: 'chokidar module options for watcher. See: https://www.npmjs.com/package/chokidar',
      format: '*',
      default: { 
        awaitWriteFinish: { 
          stabilityThreshold: 2000,
          pollInterval: 100
        },
        ignored: /(^|[\/\\])\../
      },
    },
    directories: {
      doc: 'Directories the watcher should watch for files plus extensions on files.',
      format: '*',
      default: { '/Users/JR/dropbox1': {priority: 10, extensions: ['*.txt','*.tar'] }},
      /*
      default: [ 
        { 
          path:'/Users/JR/dropbox1',
          priority: '10',
          extensions: ['*.txt','*.tar']
        },
      ],*/
      env: 'DIRECTORIES'
    }
  },
  // Must be postgres so that we can use the pg-boss queue module
  postgres: {
    username: {
      format: String,
      default: 'postgres',
      env: 'PG_USERNAME'
    },
    password: {
      format: String,
      default: '',
      sensitive: true,
      env: 'PG_PASSWORD'
    },
    host: {
      format: '*',
      default: 'localhost',
      env: 'PG_HOST'
    },
    db_name: {
      format: String,
      default: 'o2-queue',
      env: 'DB_NAME'
    }
  }
});

const env = config.get('env');
config.loadFile(`./src/config/${env}.json`);

config.validate({ allowed: 'strict' }); // throws error if config does not conform to schema

module.exports = config.getProperties(); // so we can operate with a plain old JavaScript object and abstract away convict (optional)
