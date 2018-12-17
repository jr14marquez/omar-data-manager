// config.js
require('dotenv').config();
const convict = require('convict');

const config = convict({
  env: {
    doc: 'The application environment',
    format: ['production', 'development', 'test'],
    default: 'development',
    arg: 'nodeEnv',
    env: 'NODE_ENV'
  },
  archive_dir: {
    doc: 'The path to the archive directory where data should be written to.',
    format: String,
    default: '/home/rmarquez/archive',
    //default: '/Users/JR/archive',
    env: 'ARCHIVE_DIR'
  },
  failed_dir: {
    doc: 'The path to the failed directory where failed jobs should be written to.',
    format: String,
    default: '/home/rmarquez/failed',
    env: 'FAILED_DIR'
  },
  stager_url: {
    doc: 'The url of the omar-stager to ingest the image file.',
    format: 'url',
    default: 'http://localhost:8081/omar-services',
    env: 'STAGER_URL'
  },
  out_log: {
    doc: 'The output logfile',
    format: String,
    default: '/var/log/omar/omar-data-manager.log',
    env: 'OUT_LOG'
  },
  dbg: {
    doc: 'Also output to console for live debugging',
    format: 'Boolean',
    default: true,
    env: 'DBG',
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
      default: true,
      arg: 'citizen',
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
      default: 9090,
      arg: "ui",
      env: "UI"
    },
  },
  watcher: {
    // chokidar options ignoring hidden . files
    options: {
      doc: 'chokidar module options for watcher. See: https://www.npmjs.com/package/chokidar',
      format: '*',
      default: { 
        usePolling: true,
        interval: 5000,
        binaryInterval: 5000,
        atomic: true, 
        awaitWriteFinish: { 
          stabilityThreshold: 2000,
          pollInterval: 100
        },
        ignored: /(^|[\/\\])\../
      },
    },
    directories: {
      ingest: {
        path: {
          format: '*',
          default: '/home/rmarquez/data',
        },
        priority: {
          format: '*',
          default: 5
        },
        extensions: {
          format: '*',
          default: ['*.TFRD', '*.tfrd', '*.NITF', '*.NTF', '*.nitf', '*.ntf', '*.r0']
        }
      },
      adhoc: {
        path: {
          format: '*',
          default: '/home/rmarquez/adhoc',
        },
        priority: {
          format: '*',
          default: 10
        },
        extensions: {
          format: '*',
          default: ['*.TFRD', '*.tfrd', '*.NITF', '*.NTF', '*.nitf', '*.ntf', '*.r0']
        }
      }
    }  
  },
  // Must be postgres so that we can use the pg-boss queue module
  postgres: {
    host: {
      format: '*',
      default: 'localhost',
      env: 'PG_HOST'
    },
    database: {
      format: String,
      default: 'o2-queue',
      env: 'DB_NAME'
    },
    user: {
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
    schema: {
      format: String,
      default: 'public',
      env: 'SCHEMA'
    }
  },
  // JobQueue Options
  jobQueue: {
    expireCheckIntervalMinutes: {
      format: 'int',
      default: 2,
      env: 'EXPIRE_CHECK_INTERVAL_MINUTES'
    },
    archiveCompletedJobsEvery: {
      format: String,
      default: '1 hour',
      env: 'ARCHIVE_COMPLETED_JOBS_EVERY'
    },
    archiveCheckIntervalMinutes: {
      format: 'int',
      default: 20,
      env: 'ARCHIVE_CHECK_INTERVAL_MINUTES'
    },
    deleteArchivedJobsEvery: {
      format: String,
      default: '6 days',
      env: 'DELETE_ARCHIVED_JOBS_EVERY'
    },
  },
});

const env = config.get('env');
config.loadFile(`${process.env.CONFIG_PATH}/${env}.json`)
config.validate({ allowed: 'strict' }); // throws error if config does not conform to schema

module.exports = config.getProperties(); // so we can operate with a plain old JavaScript object and abstract away convict (optional)
