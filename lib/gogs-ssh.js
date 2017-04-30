'use strict';

var fs = require('fs');
var childProcess = require('child_process');
var path = require('path');
var request = require('request');

function validate(app, req, res){
  var secret = req.body.secret;
  if(app.get('secret') !== secret) return res.status(403).json({error: 'Invalid secret!'});

  if(!req.body.repository) return res.status(400).json({error: 'no repository is given'});

  return null;
}

function deploy(app, url, req, res){

  var tmpFile = path.resolve('/tmp/.tmp_script');

  return childProcess.exec(`git archive --format=tar --remote=${url} HEAD: deploy.crane|tar -xO > ${tmpFile}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error fetching from: ${url} error: ${error}`);
        return res.status(400).json({error: `error during fetching the file: ${url} error: ${error}`});
      }

      fs.chmodSync(tmpFile, '0755');

      childProcess.execFile(tmpFile,
        { env: {'COMMIT_ID': req.body.after} },
        (err, stdout, stderr) => {
        if(err) {
          var msg = `Error occurred \n` +
                    `error: ${err} \n` +
                    `stdout: ${stdout} \n` +
                    `stderr: ${stderr}`;

          return res.status(400).json({err: msg});
        }
        else return res.send(`stdout:\n${stdout}stderr:\n${stderr}`);
      });
    });
}

function gogsUrl(app, req){
  var branch = app.get('branch');
  var repoUrl = req.body.repository.ssh_url;
  var url = repoUrl;
  return url;
}

module.exports.validate = validate;
module.exports.deploy = deploy;
module.exports.url = {
  gogs: gogsUrl
};

