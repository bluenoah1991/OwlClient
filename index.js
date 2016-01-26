/**
 * Created by CodeMeow on 2016/1/22.
 */

'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

var mqtt = require('mqtt');
var client = null;

app.on('window-all-closed', function(){
    if(process.platform != 'darwin') {
        app.quit();
    }
});

var local = this;

electron.ipcMain.on('mqtt-connect', function(event, arg){
    local.log = function(logstr){
        event.sender.send('log', logstr);
    }

    local.log('Begin connecting');

    var options = {
        'host': arg.ip_address,
        'port': arg.port,
        'clientId': arg.client_id,
        'protocolId': 'MQIsdp',
        'protocolVersion': 3,
        'connectTimeout': arg.timeout,
        'keepalive': parseInt(arg.keepalive),
        'clean': arg.clean_session
    };
    if(!!arg.will_flag){
        options.will = {
            'topic': arg.will_topic,
            'payload': arg.will_payload,
            'qos': arg.will_qos,
            'retain': arg.will_retain
        };
    }
    client = mqtt.connect(options);
    client.on('connect', function(){
        if(!!local.log){
          local.log('Connect successfully');
        }
    });
    client.on('close', function(){
        local.log('The connection is closed(from close callback)');
    });
    client.on('message', function(topic, payload){
        event.sender.send('message', {
            'topic': topic,
            'payload': payload
        });
    });

});

electron.ipcMain.on('mqtt-disconnect', function(event){
    if(!!local.log){
        local.log('Disconnect');
    }
    if(!!client){
      client.end();
    }
});

electron.ipcMain.on('mqtt-subscribe', function(event, arg){
    if(!!local.log){
        local.log('Subscribe');
    }
    if(!!client){
        client.subscribe(arg, function(err, granted){
            if(!!local.log){
                local.log('Subscription success(from subscribe callback)');
            }
        });
    }
});

electron.ipcMain.on('mqtt-unsubscribe', function(event, arg){
    if(!!local.log){
        local.log('Unsubscribe');
    }
    if(!!client){
      client.unsubscribe(arg, function(err, granted){
          if(!!local.log){
              local.log('Unsubscription success(from unsubscribe callback)');
          }
      });
    }
});

electron.ipcMain.on('mqtt-publish', function(event, arg){
    if(!!local.log){
          local.log('Publish "' + arg.message + '" to "' + arg.topic + '"');
    }
    if(!!client){
      client.publish(arg.topic, arg.message, function(err, granted){
          if(!!local.log){
                local.log('Publish success(from publish callback)');
          }
      });
    }
});

app.on('ready', function(){
    mainWindow = new BrowserWindow({width: 600, height: 800});
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function(){

        mainWindow = null;
    });

});
