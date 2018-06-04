// config.js
require('dotenv').config();
const convict = require('convict');

const config = convict({
 env: {
   format: ['prod', 'dev', 'test'],
   default: 'dev',
   arg: 'nodeEnv',
   env: 'NODE_ENV'
 },
 node: {
    address: {
      doc: "The port this node should be listening on.",
      format: '*',
      default: '0.0.0.0:3000',
      arg: 'address',
      env: 'ADDRESS'
    },
    peers: {
      doc: "All nodes/peers in the system including itself",
      format: Array,
      default: ['0.0.0.0:3000','0.0.0.0:3001','0.0.0.0:3002'],
    }
  }
});

const env = config.get('env');
config.loadFile(`./src/config/${env}.json`);

config.validate({ allowed: 'strict' }); // throws error if config does not conform to schema

module.exports = config.getProperties(); // so we can operate with a plain old JavaScript object and abstract away convict (optional)