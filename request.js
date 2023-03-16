////////////////////////////IMPORTS/////////////////////////////////
"use strict";
var https = require("https"),
  fs = require("fs"),
  localPath;
////////////////////////////END IMPORTS////////////////////////////////////
////////////////////////////CONFIGURATION OBJECTS///////////////////////\
var initConfig = {
  hostname: "scoresdownload.collegeboard.org",
  port: "443",
  path: "/pascoredwnld/files/list",
  method: "POST",
  rejectUnauthorized: false,
  requestCert: true,
  agent: false,
  json: true,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  username: "karenfosterCEI",
  password: "KFcna006&5",
};
//global configs
var postData,
username,
  password,
  options,
  hostname,
  port,
  path,
  method,
  rejectUnauthorized,
  requestCert,
  agent,
  json,
  headers,
  username,
  password
//global variable which settings are imported into
var automationSettings;
//global array to put stuff in
var gArray = [];
//current date
var today = new Date();
//log of current activity
var log = `- ${today} - \n`
//read in initConfig
var _initConfig = {}

//////////////////////////////END CONFIGURATION OBJECTS/////////////
////////////////////////////JOB FUNCTIONS/////////////////////////////////////
//this function sends an https request to a website to get a response containing txt and csv file listings, writes a log file with the pertinent, and downloads the csv files to the directory indicated in automationSettings.json (by default)
function sat() {
    requ(satParser, true)
}
function satParser(ddd) {
    var parsed = p(ddd);
    // var [spreaded] = [ddd,...ddd]
    // console.log('spreaed', spreaded)
    //read through the results until finding ".csv", then backup until the previous quotation mark while counting characters, and create the substring which should contain the filename
    var wordLength = 0;
    var end = ddd.length;
    var endIndex = 0;
    var fileExtension = '.csv';
    var startCharacter = '"';
    var startIndex = 0;
    var fileName = ''

    let position = 0;
  //function to grab multiple instances and add to array
    // while (position !== -1) {
    //   endIndex = ddd.indexOf(fileExtension, position) + fileExtension.length;
    //   for(var i = endIndex; i > 0; i--) { 
    //     if(ddd[i] === ':') {
    //       i = -1;
    //     } else {
    //       startIndex = i;
    //     }
    //   }
    //insert some cool stuff bhere
    // endIndex = ddd.indexOf(fileExtension, position) + fileExtension.length;
    // fileName = ddd.substring(startIndex+2, endIndex);
// }
// gArray.push(fileName);
      // position = ddd.indexOf(fileExtension, endIndex);
      endIndex = ddd.indexOf(fileExtension, 0) + fileExtension.length;
            for(var i = endIndex; i > 0; i--) { 
        if(ddd[i] === ':') {
          i = -1;
        } else {
          startIndex = i;
        }
      }
      fileName = ddd.substring(startIndex+1, endIndex);
      console.log('fileName', fileName)
      //read the log into a file
      // var saveLog = String(fs.readFileSync(`${automationSettings.logPath}satlog.txt`, "utf8"));
      var saveLog = fs.readFileSync(`${automationSettings.logPath}satlog.txt`, "utf8");
      // var saveLog = readFile(`${automationSettings.logPath}satlog.txt`)
      console.log('savelog', saveLog)
      //check if the file is already downloaded
      if(saveLog.indexOf(`${fileName} downloaded`) <  0) {
        console.log(`${fileName} not downloaded yet, downloading...\n`);
        // get(fileName,'https://scoresdownload.collegeboard.org/pascoredwnld/file?filename='+fileName)
        downloadFile(_initConfig,fileName, download)

        console.log(`File download path:  ${automationSettings.downloadPath} name: ${fileName} \n`);
      } else {
        console.log(`${fileName} already downloaded`);
      }
      // console.log('endIndex: ', endIndex, 'fileName: ', fileName, 'array', gArray);
}
//call main function - this is the business end of the program!!!
main()
///////////////////////////END JOB FUNCTIONS///////////////////////////////////
///////////////////////////FILE IO FUNCTIONS////////////////////////////////
//send a file to the filesystem
function pipeResponse(res, fileName, filePath=automationSettings.downloadPath) {
  var file = fs.createWriteStream(filePath+fileName);
  res.pipe(file);
  file.on('finish', function () {
      file.close();
      console.log('');
      console.log('File Downloaded: ' + filePath+fileName);
  });
}
function readFile(theFiletoRead) {
  try {
    const data = fs.readFileSync(theFiletoRead, "utf8");
    // console.log(data);
    // initConfig = JSON.parse(data);
    return JSON.parse(data);
  } catch (err) {
    console.error(err);
  }
}
function writeFile(
  theDatatoWrite = { insertData: "here" },
  theFile = "automationSettings.json"
) {
  fs.appendFile(theFile, JSON.stringify(theDatatoWrite), (err) => {
    if (err) {
      console.error(err);
    }
    // done!
  });
}
//read the settings from ./automationSettings.json and set them to the global automationSettings variable, at least by default.data
function getAutomationSettings(
  saveFile = automationSettings,
  filetoRead = "automationSettings.json"
) {
    //by defaultm, this sets the global automationSettings variable to the read inputs of ./automationSettings.json
    automationSettings = readFile(filetoRead);
    // console.log('seeetings', automationSettings);
    // JSON.parse(
}
//////////////////////////////END FILE IO FUNCTIONS///////////////////////////
///////////////////////////HTTPS FUNCTIONS/////////////////////////////
// var downloadFile = function(config, fileName, callback) {
function downloadFile(config, fileName, callback) {
  var postData = {"username":config.username,"password":config.password};
  var options = {
      hostname: config.scoredwnldHost,
      port: config.scoredwnldPort,
      path: '/pascoredwnld/file?filename='+fileName,
      method: 'POST',
      rejectUnauthorized: false,
      requestCert: true,
      agent: false,
      json:true,
      headers: {
          'Content-Type': 'application/json',
          'Accept':'application/json'
      }
  };
  console.log('FILENAME', fileName)
  console.log(`SETTINGS ${postData}, ${JSON.stringify(options)}, ${config}`)
  console.log(`SETTINGSSSSSSSSSSSSSSSSSSSS`, automationSettings.initConfig)

  var request = https.request(options,
      function(response) {
        // console.log(request)
          var body = "";
          if (response.statusCode === 200) {
              response.setEncoding('utf8');
              response.on('data', function (data) {
                  body = body + data;
              });
              response.on('end', function() {
                  var jsonObj = JSON.parse(body);
                  console.log('');
                  console.log('downloadFile - file url obtained: ');
                  console.log('');
                  console.log(jsonObj);
                  callback(jsonObj.fileUrl, jsonObj.filePath, config.localFilePath);
              });
          }
          else {
              console.log('');
              console.log('downloadFile failed: ' + response.statusCode);
              process.exit(1);
          }
          // Add timeout.
          request.setTimeout(60000, function () {
              console.log('');
              console.log('downloadFile time out');
              request.abort();
          });
      });

  request.on('error', (e) => {
    console.error(e);
  });

  request.write(JSON.stringify(postData));
  request.end();

};

// var download = function(url, filePath, localFilePath) {
  function download(url, filePath, localFilePath) {
  var request = https.get(url, function (response) {
      if (response.statusCode === 200) {
          var fileName = null; //response.headers['content-disposition'].split('filename=')[1];
          if (!fileName) {
              fileName = filePath.substring(filePath.lastIndexOf("/") + 1);
          }
          var file = fs.createWriteStream(localFilePath+fileName);
          response.pipe(file);
          file.on('finish', function () {
              file.close();
              console.log('');
              console.log('File Downloaded: ' + localFilePath+fileName);
          }); 
      }
      request.setTimeout(60000, function () {
          console.log('');
          console.log('download time out');
          request.abort();
      });
  });

  request.on('error', (e) => {
    console.error(e);
  });

  request.end();
};
//https request - set logData to true to view response in the console
function requ(functionPerformingSomethingWithTheResponse, logData = false) {
  //make a pointer
  // var aS = automationSettings;
  var postData = {
    username: automationSettings.username,
    password: automationSettings.password,
  };
  var options = {
    hostname: automationSettings.scoredwnldHost,
    port: automationSettings.scoredwnldPort,
    path: automationSettings.path,
    method: automationSettings.method,
    rejectUnauthorized: automationSettings.rejectUnauthorized,
    requestCert: automationSettings.requestCert,
    agent: automationSettings.agent,
    json: automationSettings.json,
    headers: automationSettings.headers,
    username: automationSettings.username,
    password: automationSettings.password
  };

  //load up initialization settings
_initConfig = {
  scoredwnldHost: automationSettings.scoredwnldHost, 
  scoredwnldPort: automationSettings.scoredwnldPort,
  localFilePath: automationSettings.downloadPath,
  username:automationSettings.username,
  password:automationSettings.password
};
    // console.log("request settignsa", postData, options);

 var request = https.request(options, function (response) {
  var body = "";
  if (response.statusCode === 200) {
    response.setEncoding("utf8");
    response.on("data", function (data) {
      body = body + data;
    });
    response.on("end", function () {
      // var jsonObj = JSON.parse(body);
      console.log("");
      console.log("downloadFile - file url obtained: ");
      console.log("");
      //this here's the magic parsing function.  in the case of SAT, it will find the filename and then download some MF'in csv files.  TADA!
      functionPerformingSomethingWithTheResponse(body);
      // console.log(jsonObj);
      //ADD CALLBACK HERE!!!////////////////////////////////////////////////////
    //   callback(jsonObj.fileUrl, jsonObj.filePath, config.localFilePath);
    });
  } else {
    console.log("");
    console.log("downloadFile failed: " + response.statusCode);
    process.exit(1);
  }
  // Add timeout.
  request.setTimeout(68000, function () {
    console.log("");
    console.log("downloadFile time out");
    request.abort();
  });
});

request.on("error", (e) => {
  console.error(e);
});

request.write(JSON.stringify(postData));
request.end();
}
/////////////////////////////END HTTPS FUNCTIONS//////////////////////////////////
/////////////////////////////MAIN//////////////////////////////////////////////////
//put it in a function for HOISTING YEAH BABY!!!
function main() {
  getAutomationSettings();
  sat()
  // if (process.argv.length >= 4 && process.argv[2] === "download") {
  //   //download one file by filename
  //   downloadFile(initConfig, process.argv[3], download);
  //   console.log("One file to download");
  // } else if (process.argv.length >= 3 && process.argv[2] === "list") {
  //   //print the list of downloadable files
  //   // readFile();
  //   printDownloadableFiles(initConfig);
  //   console.log("List of files to download");
  // } else if (process.argv.length >= 3 && process.argv[2] === "writeConfig") {
  //   writeFile(initConfig);
  // } else if (process.argv.length >= 3 && process.argv[2] === "goat") {
  //     // printDownloadableFiles(initConfig);
  //     getAutomationSettings();
  //     sat()
  // } else {
  //   console.log("Usage:");
  //   console.log("1) node request.js list");
  //   console.log("2) node request.js download <filename>");
  //   console.log(
  //     "3) node request.js writeConfig \nwill print by default to ./automationSettings.json some niice default initialization settings as hardcoded to initConfig to use as a template"
  //   );
  //   console.log(
  //     "4) node request.js goat \nshort for Greatest Of All Time whereby the program will automatially download some files to a directory based on the settings in ./automationSettings.json"
  //   );
  // }
}
////////////////////////////END MAIN///////////////////////////////////////////
////////////////////////////UTILITIES//////////////////////////////////////////
//quick JSON.parse tool
function p(c) {
  return JSON.parse(c)
}
//quick JSON.stringify tool
function s(c) {
  return JSON.stringify(c)
}
////////////////////////////END UTILITIES//////////////////////////////////////
