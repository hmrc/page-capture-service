const fs = require('fs')
const path = require('path')

const express = require('express')
const app = express()
const port = 6001

app.use(express.json({limit: '500mb',}));
var capturedUrls = [];
var excludedUrls = [];
var testOnlyRegEx = RegExp('test\-only');
var stubRegEx = RegExp('http:\/\/localhost:[0-9]{4}\/([a-z/-]+\-stub)');

app.post('/page-data', (req, res) => {
  const body = req.body;
  const logData = Object.assign({}, body)
  const rootDir = path.join(__dirname,  'output', '' + body.timestamp)
  logData.pageHTML = logData.pageHTML.substr(0, 100) + '...'
  logData.files = Object.keys(logData.files)

  //Capture the page for assessment if:
  //   - it hasn't already been captured
  //   - the page is not served from a stub
  //   - the page is not test only
  if(!capturedUrls.includes(body.pageURL) && !stubRegEx.test(body.pageURL) && !testOnlyRegEx.test(body.pageURL)) {
    capturedUrls.push(body.pageURL)
    const fileList = Object.assign({}, body.files, {'index.html': '<!DOCTYPE html>\n' + body.pageHTML}, {'data': body.pageURL})
    fs.mkdirSync(rootDir, { recursive: true })
    Object.keys(fileList).forEach(fileName => {
      fs.writeFile(path.join(rootDir, fileName), fileList[fileName], (err, data) => {
        if (err) {throw err}
        console.log('saved file', fileName, body.pageHTML.substr(0, 20) + '...')
      })
    })
  } else {
    excludedUrls.push(body.pageURL)
  }
  console.log(logData)

  res.status('201').send('Done')
})

app.get('/urls', (req, res) => {
  res.status(200).send(capturedUrls)
})

app.get('/excluded-urls', (req, res) => {
  res.status(200).send(excludedUrls)
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
