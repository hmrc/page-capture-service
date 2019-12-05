const path = require('path')

const config = {
  port: parseInt(process.env.APP_PORT) || 6001,
  captureAllPages: process.env.CAPTURE_ALL_PAGES || false,
  pagesParentPath: process.env.WORKSPACE || __dirname
}

module.exports = config
