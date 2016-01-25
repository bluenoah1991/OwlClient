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

electron.ipcMain.on('mqtt-connect', function(event, arg){
    console.log(arg);
    client = mqtt.connect({
        'host': arg.ip_address,
        'port': arg.port,
        'clientId': arg.client_id,
        'protocolId': 'MQIsdp',
        'protocolVersion': 3,
        'connectTimeout': arg.timeout
    });
    client.on('close', function(){
        console.log('close callback');
    });
    client.on('message', function(topic, payload){
        event.sender.send('message', {
            'topic': topic,
            'payload': payload
        });
    });
    console.log(client);
});

electron.ipcMain.on('mqtt-disconnect', function(event){
    console.log('disconnect');
    if(!!client){
      client.end();
    }
});

electron.ipcMain.on('mqtt-subscribe', function(event, arg){
    console.log('subscribe');
    if(!!client){
      client.subscribe(arg, function(err, granted){
        console.log('subscribe callback');
      });
    }
});

electron.ipcMain.on('mqtt-unsubscribe', function(event, arg){
    console.log('unsubscribe');
    if(!!client){
      client.unsubscribe(arg, function(err, granted){
        console.log('unsubscribe callback');
      });
    }
});

electron.ipcMain.on('mqtt-publish', function(event, arg){
    console.log('publish');
    if(!!client){
      client.publish(arg.topic, arg.message, function(err, granted){
        console.log('publish callback');
      });
    }
});

app.on('ready', function(){
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL('file://' + __dirname + '/index.html');

    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function(){

        mainWindow = null;
    });

});
