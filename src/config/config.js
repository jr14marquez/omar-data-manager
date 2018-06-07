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
      default: false
    },
    peers: {
      doc: 'All nodes/peers in the system including itself',
      format: Array,
      default: ['0.0.0.0:3000','0.0.0.0:3001','0.0.0.0:3002'],
    },
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
      doc: 'Directories the watcher should watch for files.',
      format: Array,
      default: ['/home/rmarquez/temp'],
    }
  },
  // Must be postgres so that we can use the pg-boss queue module
  postgres: {
    username: {
      format: String,
      default: 'postgres',
    },
    password: {
      format: String,
      default: 'postgres',
      sensitive: true,
    },
    host: {
      format: '*',
      default: 'localhost',
    },
    db_name: {
      format: String,
      default: 'o2-queue',
    }
  }
});

const env = config.get('env');
config.loadFile(`./src/config/${env}.json`);

config.validate({ allowed: 'strict' }); // throws error if config does not conform to schema

module.exports = config.getProperties(); // so we can operate with a plain old JavaScript object and abstract away convict (optional)
