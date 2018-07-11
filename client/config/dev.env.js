var merge = require('webpack-merge')
var prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  UI: JSON.stringify(process.env.UI) || '"8080"',
  BACKGROUND_COLOR: JSON.stringify(process.env.BACKGROUND_COLOR) || '"#008b00"',
  CLASSIFICATION_TYPE: JSON.stringify(process.env.CLASSIFICATION_TYPE) || '"UNCLASSIFIED"'
})
