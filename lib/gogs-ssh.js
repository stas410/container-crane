'use strict';

const fs = require('fs');
const { spawn } = require('child_process');
const path = require('path');
const request = require('request');

function validate(app, req, res){
  const secret = req.body.secret;
  if(app.get('secret') !== secret) return res.status(403).json({error: 'Invalid secret!'});

  if(!req.body.repository) return res.status(400).json({error: 'no repository is given'});

  return null;
}

function deploy(app, url, req, res, publish) {

  const tmpFile = path.resolve('/tmp/.tmp_script');

  let outputBuf = '';
  function publishWrapper (type, payload) {
    outputBuf += payload
    publish(type, payload)
  }

  publish('new', 'New hook notification')

  return childProcess.exec(`git archive --format=tar --remote=${url} HEAD: deploy.crane|tar -xO > ${tmpFile}`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`error fetching from: ${url} error: ${error}`);
        return res.status(400).json({error: `error during fetching the file: ${url} error: ${error}`});
      }

      publish('stdout', 'deploy.crane fetched')

      fs.chmodSync(tmpFile, '0755');

      let timeoutPromise = new Promise((fulfill, reject) => {
        setTimeout(fulfill, 2000, 'in-progress');
      });

      let execPromise = new Promise((fulfill, reject) => {
        let process = spawn(tmpFile, {env: {'COMMIT_ID': req.body.after}});

        process.stdout.on('data', data => publishWrapper('stdout', String(data));
        process.stderr.on('data', data => publishWrapper('stderr', String(data));
        process.on('close', code => {
          publishWrapper('close', `child process exited with code ${code}`);
          fulfill('done');
        });
        process.on('error', err => {
          publishWrapper('error', `Error: ${err}`);
          reject(err);
        })
      });

      Promise.race([execPromise, timeoutPromise]).then(msg => {
        res.send(msg + ': ' + outputBuf);
      })
      .catch(reason => {
        return res.status(400).json({err: reason});
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

