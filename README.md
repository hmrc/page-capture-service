
# page-capture-service
The Page Capture Service is a lite weight, single file service built using [expressjs](https://expressjs.com/). The service exposes a single API to capture HTML pages (along with associated css/javascript assets) uploaded via HMRC's [page-capture-chrome-extension](https://github.com/hmrc/remote-webdriver-proxy-scripts/tree/master/page-capture-chrome-extension).  These pages are then written to a configurable location on the file system.

## Getting started
You can pull all required dependencies down by running:

`npm install`

...from the project root directory.

## Running the server locally
To run the server, execute:

`node server.js`

...from the project root directory.

The service is currently configured to start on port 6001 as we allow access to localhost 6001-6010 from our build slave side car containers.

## Service configuration
When running the service locally you can update [config.js](config.js), or set the following environment variables:
- **port**: defaults the environment variable named **APP_PORT** if set.  Otherwise, it's set to 6001
- **captureAllPages**: defaults to the environment variable named **CAPTURE_ALL_PAGES** if set.  Otherwise, it's set to **false**.  When set to false the service will capture a single version of each page by path.  Setting this to **true** will capture every page uploaded to the service.
- **pagesParentPath**: defaults to the value of the **WORKSPACE** environment variable (for use in Jenkins).  If not set, pages are saved to a sub-directory of the current working directory 

## License
This code is open source software licensed under the [Apache 2.0 License]("http://www.apache.org/licenses/LICENSE-2.0.html").
