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

    if(!!local.log){
        local.log('Begin connecting');
    }
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
    client.on('error', function(err){
        if(!!local.log){
            local.log(err);
        }
    });
    client.on('close', function(){
        if(!!local.log){
            local.log('The connection is closed(from event "close")');
        }
    });
    client.on('message', function(topic, payload){
        if(!!local.log){
            local.log('Received "' + payload + '" from "' + topic + '"');
        }
    });

});

electron.ipcMain.on('mqtt-disconnect', function(event){
    if(!!local.log){
        local.log('Disconnect');
    }
    if(!!client){
        client.end(function(){
            if(!!local){
              local.log('The connection is closed(from callback "end")');
            }
        });
    } else {
        if(!!local.log){
            local.log('The connection is not established');
        }
    }
});

electron.ipcMain.on('mqtt-subscribe', function(event, arg){
    if(!!local.log){
        local.log('Subscribe(Topic is "' + arg.topic + '")');
    }
    if(!!client){
        client.subscribe(arg.topic, {'qos': parseInt(arg.qos)}, function(err, granted){
            if(!!local.log){
                for(let _ in granted){
                    local.log('Subscription success(Topic is "' +
                      granted[_].topic + '" and QoS is ' + granted[_].qos + ')');
                }
            }
        });
    } else {
        if(!!local.log){
            local.log('The connection is not established');
        }
    }
});

electron.ipcMain.on('mqtt-unsubscribe', function(event, arg){
    if(!!local.log){
        local.log('Unsubscribe(Topic is "' + arg.topic + '")');
    }
    if(!!client){
      client.unsubscribe(arg.topic, function(err, granted){
          if(!!local.log){
              local.log('Unsubscription success(from callback "unsubscribe")');
          }
      });
    } else {
        if(!!local.log){
            local.log('The connection is not established');
        }
    }
});

electron.ipcMain.on('mqtt-publish', function(event, arg){
    if(!!local.log){
          local.log('Publish "' + arg.message + '" to "' + arg.topic +
            '"(QoS is ' + arg.qos + ' and Retain is ' + arg.retain + ')');
    }
    if(!!client){
      client.publish(arg.topic, arg.message, {
          'qos': parseInt(arg.qos),
          'retain': arg.retain
      }, function(err, granted){
          if(!!local.log){
                local.log('Publish success(from callback "publish")');
          }
      });
    } else {
        if(!!local.log){
            local.log('The connection is not established');
        }
    }
});

app.on('ready', function(){
    mainWindow = new BrowserWindow({width: 600, height: 900});
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    local.log = function(logstr){
        mainWindow.webContents.send('log', logstr);
    }

    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function(){

        mainWindow = null;
    });

});
