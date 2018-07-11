module.exports = {
  NODE_ENV: '"production"',
  UI: JSON.stringify(process.env.UI) || '"8080"',
  BACKGROUND_COLOR: JSON.stringify(process.env.BACKGROUND_COLOR) || '"#008b00"',
  CLASSIFICATION_TYPE: JSON.stringify(process.env.CLASSIFICATION_TYPE) || '"UNCLASSIFIED"'
}
