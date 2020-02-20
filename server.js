const fs = require('fs')
const path = require('path')
const express = require('express')
const config = require('./config');
const app = express()

app.use(express.json({limit: '500mb',}));
var capturedUrls = [];
var excludedUrls = [];
var testOnlyRegEx = RegExp('test\-only');
var stubRegEx = RegExp('http:\/\/localhost:[0-9]{4}\/([a-z/-]+\-stub)');
var htmlContentRegEx = RegExp('<\\s*html[^>]*>([\\s\\S]*?)<\\s*\/\\s*html>');

app.post('/page-data', (req, res) => {
  const body = req.body;
  const logData = Object.assign({}, body)
  const rootDir = path.join(config.pagesParentPath,  'pages', '' + body.timestamp)
  logData.pageHTML = logData.pageHTML.substr(0, 100) + '...'
  logData.files = Object.keys(logData.files)
  const errors = Object.assign({}, {errors:logData.errors})

  if (logData.errors.length !== 0) {
      console.log(body.pageURL + ' not saved. Error reported by page-capture-chrome-extension.')
      console.log(errors)
      fs.appendFile("errored-urls.log", body.pageURL + '\n', handleErrors)
  }
  //Capture the page for assessment if:
  //   - it hasn't already been captured and onePagePerPath is true
  //   - the page urls does not contain the text 'stub'
  //   - the page is not test-only
  //   - the page contains valid HTML tags
  else if((config.captureAllPages === 'true' || !capturedUrls.includes(body.pageURL))
      && !stubRegEx.test(body.pageURL)
      && !testOnlyRegEx.test(body.pageURL)
      && htmlContentRegEx.test(body.pageHTML)){
    capturedUrls.push(body.pageURL)
    fs.appendFile("urls.log", body.pageURL + '\n', handleErrors)
    const fileList = Object.assign({}, body.files, {'index.html': '<!DOCTYPE html>\n' + body.pageHTML}, {'data': body.pageURL})
    fs.mkdirSync(rootDir, { recursive: true })
    Object.keys(fileList).forEach(fileName => {
      fs.writeFile(path.join(rootDir, fileName), fileList[fileName], (err, data) => {
        if (err) {throw err}
      })
    })
      console.log('Saved Page: \n', logData)
  } else {
    if(!capturedUrls.includes(body.pageURL) && !excludedUrls.includes(body.pageURL) ) {
      fs.appendFile("excluded-urls.log", body.pageURL + '\n', handleErrors)
      excludedUrls.push(body.pageURL)
    }
  }
  res.status('201').send('Done')
})

app.get('/urls', (req, res) => {
  res.status(200).send(capturedUrls)
})

app.get('/excluded-urls', (req, res) => {
  var returnUrls = excludedUrls.filter( function (element) {
    return !capturedUrls.includes(element)
  })
  res.status(200).send(returnUrls)
})

app.listen(config.port, () => console.log(`Page Capture Service App listening on port ${config.port}!`))
console.log('Capturing All Pages?: ' + config.captureAllPages)

function handleErrors(err) {
  if (err) throw err;
}
