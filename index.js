/**
 * Created by CodeMeow on 2016/1/22.
 */

'use strict';

const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

var mainWindow = null;

app.on('window-all-closed', function(){
    if(process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function(){
    mainWindow = new BrowserWindow({width: 800, height: 600});
    mainWindow.loadURL('file://' + __dirname + '/index2.html');

    mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function(){

        mainWindow = null;
    });

});