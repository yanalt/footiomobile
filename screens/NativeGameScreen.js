// import * as WebBrowser from 'expo-web-browser';
import React, {Component} from 'react';
import io from 'socket.io-client';
import {
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    Button,
    StatusBar,
    Dimensions,
    YellowBox
} from 'react-native';
import {GLView} from 'expo-gl';

import Expo2DContext from 'expo-2d-context';
import {AdMobBanner} from 'expo-ads-admob';
import {hostConfig} from '../config';
import axios from 'axios';
import Canvas from 'react-native-canvas';
import Image from 'react-native-canvas';
console.disableYellowBox = true;

_storeData = async(str, val) => {
    try {
        await AsyncStorage.setItem(str, val);
    } catch (e) {
        console.log(e);
    }
};

_retrieveData = async(str) => {
    try {
        const value = await AsyncStorage.getItem(str);
        if (value !== null) {
            // We have data! console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};

let socket;
let canvasHolder;
let graph;
let reason;
let currentFrame = 0;
let comArr = [];
let comIndex = 0;
let characterSprites = [];
let characterAmount = 50;
let ballSprites = [];
let disconnected = false;
let animLoopHandle = false;

let start = 0;
let finish = 0;
let ticks = 0;

let global = {
    // Canvas
    commercialCount: 8,
    screenWidth: Dimensions
        .get('window')
        .width,
    screenHeight: Dimensions
        .get('window')
        .height,
    gameWidth: 0,
    gameHeight: 0,
    gameStart: false,
    disconnected: false,
    kicked: false,
    startPingTime: 0,
    backgroundColor: '#7EC850',
    lineColor: '#000000',
    buttonAlignment: 'right',
    usingMobileVersion: true
};

function prepCharacterSprites() {
    for (let i = 0; i <= characterAmount; i++) {
        characterSprites[i] = new Image();
    }
}

function loadCharacterSprites(sprite) {
    if (!sprite) 
        characterSprites[0].src = "../assets/images/0.png";
    else if (characterSprites[sprite] && characterSprites[sprite].src == "") 
        characterSprites[sprite].src = "../assets/images/" + sprite + ".png";
    }

function loadBallSprites() {
    for (let i = 0; i <= 9; i++) {
        ballSprites[i] = new Image();
        ballSprites[i].src = "../assets/images/ball" + i + ".png";
    }
}

function initCommercialImages(count) {
    for (var i = 0; i < count; i++) {
        comArr[i] = new Image();
        comArr[i].src = "../assets/images/commercials/" + i + ".png";
    }
}

function startGame() {
    prepCharacterSprites();
    loadBallSprites();
    // initCommercialImages(global.commercialCount);
    global.playerName = "";
    global.screenWidth = Dimensions
        .get('window')
        .width;
    global.screenHeight = Dimensions
        .get('window')
        .height;
    console.log(Dimensions.get('window').width);
    if (!socket) {
        console.log('nice');
        socket = io.connect('http://10.0.0.5:3002', {
            transports: ['websocket'],
            jsonp: false
        });
        socket.on('connect', () => {
            console.log('connected to socket server');
        });
        setupSocket(socket);
    }
    if (!animLoopHandle) {
        console.log(animLoopHandle);
        animloop();
    }

    socket.emit('respawn');
}

let playerConfig = {
    border: 6,
    textColor: '#FFFFFF',
    textBorder: '#000000',
    textBorderSize: 3,
    defaultSize: 30
};

let player = {
    id: -1,
    screenWidth: global.screenWidth,
    screenHeight: global.screenHeight,
    target: {
        x: global.screenWidth / 2,
        y: global.screenHeight / 2
    }
};
global.player = player;

let goalkeepers = [];
goalkeepers[0] = {
    position: {
        x: 0,
        y: 0
    }
};
goalkeepers[1] = {
    position: {
        x: 0,
        y: 0
    }
};
let users = [];
let score = {
    blue: 0,
    red: 0
};

let usersExpanded = [];
let ball = {

    id: null,
    target: {
        x: 0,
        y: 0
    },
    x: 0,
    y: 0,
    frame: 0,
    speed: 1
};

let target = {
    x: global.screenWidth / 2,
    y: global.screenHeight / 2
};

function setupSocket(socket) {
    // Handle ping.
    socket
        .on('pongcheck', function () {
            var latency = Date.now() - global.startPingTime;
            // debug('Latency: ' + latency + 'ms');
            console.log('Latency: ' + latency + 'ms');
        });

    // Handle error.
    socket.on('connect_failed', function () {
        socket.close();
        global.disconnected = true;
    });

    socket.on('disconnect', function () {
        socket.close();
        global.disconnected = true;
    });

    // Handle connection.
    socket.on('welcome', function (playerSettings) {
        player = playerSettings;
        player.name = global.playerName;
        player.screenWidth = global.screenWidth;
        player.screenHeight = global.screenHeight;
        player.target = target;
        player.conf = 'lol';
        player.name = 'lol';

        global.player = player;
        socket.emit('gotit', player);
        global.gameStart = true;
    });

    socket.on('gameSetup', function (data) {
        global.gameWidth = data.gameWidth;
        global.gameHeight = data.gameHeight;
        global.goalWidth = data.goalWidth;
        global.goalkeeperRadius = data.goalkeeperRadius;
    });

    // Handle movement.
    socket.on('3', function (userData, serverBall, serverGoalkeepers) {
        var playerData;
        for (var i = 0; i < userData.length; i++) {
            if (typeof(userData[i].id) == "undefined") {
                playerData = userData[i];
                i = userData.length;
            }
        }
        player.xoffset = player.x - playerData.x;
        player.yoffset = player.y - playerData.y;

        player.x = playerData.x;
        player.y = playerData.y;
        player.xoffset = isNaN(player.xoffset)
            ? 0
            : player.xoffset;
        player.yoffset = isNaN(player.yoffset)
            ? 0
            : player.yoffset;

        users = userData;
        ball = serverBall;
        goalkeepers = serverGoalkeepers;
    });

    //slower socket for non-movement information

    socket.on('4', function (serverScore, serverUsers) {
        if (serverScore) {
            score = serverScore;
        }
        usersExpanded = serverUsers;
        usersExpanded.forEach(u => {
            loadCharacterSprites(u.skinsprite);
        });
    });

    socket.on('kick', function (data) {
        global.gameStart = false;
        reason = data;
        global.kicked = true;
        socket.close();
    });

    // socket.on('goal', function (data) {     var soundId = "goal" +
    // (Math.floor(Math.random() * (4 - 1)) + 1);     // console.log(soundId);
    // document     .getElementById(soundId)     .volume =     // 0.2; document
    // .getElementById(soundId)     .play(); });

}

function drawCircle(centerX, centerY, radius, sides) {
    var theta = 0;
    var x = 0;
    var y = 0;

    graph.beginPath();

    for (var i = 0; i < sides; i++) {
        theta = (i / sides) * 2 * Math.PI;
        x = centerX + radius * Math.sin(theta);
        y = centerY + radius * Math.cos(theta);
        graph.lineTo(x, y);
    }

    graph.closePath();
    graph.stroke();
    graph.fill();
}

function drawCommercials(index) {
    var comDiv = 8;
    var comHeight = 70;
    for (var i = 0; i < comDiv; i++) {
        var x = global.screenWidth / 2 - player.x + i * global.gameWidth / comDiv;
        var y = global.screenHeight / 2 - player.y - comHeight;
        // graph.drawImage(comArr[index + i % 2], x, y, global.gameWidth / comDiv,
        // comHeight);
    }

    for (let i = 0; i < comDiv; i++) {
        var a = global.screenWidth / 2 - player.x + i * global.gameWidth / comDiv;
        var b = global.gameHeight + global.screenHeight / 2 - player.y;
        // graph.drawImage(comArr[index + i % 2], a, b, global.gameWidth / comDiv,
        // comHeight);
    }
}

function drawBall(ball) {
    graph.strokeStyle = 'hsl(120, 0%, 70%)';
    graph.fillStyle = 'hsl(120, 0%, 75%)';
    graph.lineWidth = playerConfig.border + 10;
    drawCircle(ball.x - player.x + global.screenWidth / 2, ball.y - player.y + global.screenHeight / 2, 10 - 5, 18 + (~~ (10 / 5)));
    // var character = new Image(); character.src = "../assets/images/ball" +
    // (Math.floor(ball.frame / 10) % 10) + ".png";
    var ballX = ball.x - player.x + global.screenWidth / 2;
    var ballY = ball.y - player.y + global.screenHeight / 2;
    // graph.drawImage(character, ballX - 15, ballY - 15, 30, 30);
    // console.log(ball.frame);
    if (!ball.frame) 
        ball.frame = 0;
        // graph.drawImage(ballSprites[(Math.floor(ball.frame / 10) % 10)], ballX - 15,
        // ballY - 15, 30, 30);
    }

function drawGoalkeeper(goalkeepers) {
    // graph.strokeStyle = 'hsl(220, 40%, 45%)'; graph.fillStyle = 'hsl(220, 40%,
    // 50%)'; graph.lineWidth = playerConfig.border + 10;
    var fontSize = 80;
    // var handDist = 0;
    var x = goalkeepers[0].position.x - player.x + global.screenWidth / 2;
    var y = goalkeepers[0].position.y - player.y + global.screenHeight / 2;
    // drawCircle(x, y, global.goalkeeperRadius, 18);

    graph.fillStyle = playerConfig.textColor;
    graph.font = 'bold ' + fontSize + 'px arial';

    // graph.strokeText("💪😂👊", x - handDist, y);
    graph.fillText("💪", x - 60, y - 20);
    graph.scale(-1, 1);
    graph.fillText("💪", -60 - x, y - 20);
    graph.scale(-1, 1);
    graph.fillText("😂", x, y);

    x = goalkeepers[1].position.x - player.x + global.screenWidth / 2;
    y = goalkeepers[1].position.y - player.y + global.screenHeight / 2;

    // graph.strokeStyle = 'hsl(0, 100%, 45%)'; graph.fillStyle = 'hsl(0, 100%,
    // 50%)'; graph.lineWidth = playerConfig.border + 10; drawCircle(x, y,
    // global.goalkeeperRadius, 18); graph.strokeText("💪😂👊", x - handDist, y);
    // graph.fillText("💪😂👊", x - handDist, y);
    graph.fillText("💪", x - 60, y - 20);
    graph.scale(-1, 1);
    graph.fillText("💪", -60 - x, y - 20);
    graph.scale(-1, 1);
    graph.fillText("😂", x, y);
}

function drawGoalDirection(team) {
    graph.lineWidth = playerConfig.textBorderSize;
    graph.fillStyle = 'Black';
    graph.strokeStyle = playerConfig.textBorder;
    graph.miterLimit = 1;
    graph.lineJoin = 'round';
    graph.textAlign = 'center';
    graph.textBaseline = 'middle';
    graph.font = 'bold ' + 14 + 'px arial';
    var distance;
    var emojiDeltaX;
    var emojiDeltaY;
    if (team == 1) {
        distance = Math.sqrt(Math.pow(player.x, 2) + Math.pow((player.y - global.screenHeight / 2), 2)); //only towards left
        emojiDeltaX = (0 - player.x * 60) / distance;
        emojiDeltaY = ((global.gameHeight / 2 - player.y) * 60) / distance;
    } else if (team == 0) {
        distance = Math.sqrt(Math.pow(global.gameWidth - player.x, 2) + Math.pow((player.y - global.screenHeight / 2), 2)); //only towards right
        emojiDeltaX = ((global.gameWidth - player.x) * 60) / distance;
        emojiDeltaY = ((global.gameHeight / 2 - player.y) * 60) / distance;
    }
    if (emojiDeltaX > 60) 
        emojiDeltaX = 60;
    if (emojiDeltaX < -60) 
        emojiDeltaX = -60;
    if (emojiDeltaY > 60) 
        emojiDeltaY = 60;
    if (emojiDeltaY < -60) 
        emojiDeltaY = -60;
    graph.fillText('🥅', global.screenWidth / 2 + emojiDeltaX, global.screenHeight / 2 + emojiDeltaY);
}

function drawBallDirection() {
    if (player.x >= ball.x - 10 && player.x <= ball.x + 10 && player.y >= ball.y - 10 && player.y <= ball.y + 10) {
        return;
    } else {
        var distance = Math.sqrt(Math.pow(ball.x - player.x, 2) + Math.pow(ball.y - player.y, 2)); //only towards left
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = 'Black';
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + 14 + 'px arial';
        graph.fillText('⚽', global.screenWidth / 2 + (ball.x - player.x) * 60 / distance, global.screenHeight / 2 + (ball.y - player.y) * 60 / distance);
    }
}

function drawScore(score) {
    graph.lineWidth = playerConfig.textBorderSize;
    graph.fillStyle = playerConfig.textColor;
    graph.strokeStyle = playerConfig.textBorder;
    graph.miterLimit = 1;
    graph.lineJoin = 'round';
    graph.textAlign = 'center';
    graph.textBaseline = 'middle';
    graph.font = 'bold ' + 14 + 'px sans-serif';
    graph.strokeText('BLUE ' + score.blue + ' : ' + score.red + ' RED', 100, 50);
    graph.fillText('BLUE ' + score.blue + ' : ' + score.red + ' RED', 100, 50);
}

function drawButton() {

    var buttonSize = canvasHolder.width / 12;

    graph.strokeStyle = 'hsl(280, 100%, 45%, 0)';
    graph.fillStyle = 'hsla(280, 0%, 50%, 0.4)';
    graph.lineWidth = playerConfig.border + 10;
    drawCircle(global.screenWidth - buttonSize, global.screenHeight - buttonSize, buttonSize, 50);
    // drawCircle(global.screenWidth / 2, global.screenHeight - buttonSize,
    // buttonSize, 50);
    drawCircle(global.screenWidth - 3 * buttonSize - 10, global.screenHeight - buttonSize, buttonSize, 50);
    drawCircle(buttonSize, global.screenHeight - buttonSize, buttonSize, 50);
    var fontSize = Math.max(40 / 3, 12);
    graph.lineWidth = playerConfig.textBorderSize;
    graph.fillStyle = playerConfig.textColor;
    graph.strokeStyle = playerConfig.textBorder;
    graph.miterLimit = 1;
    graph.lineJoin = 'round';
    graph.textAlign = 'center';
    graph.textBaseline = 'middle';
    fontSize = 36;
    graph.font = 'bold ' + fontSize + 'px arial';
    if (global.buttonAlignment == 'right') {
        graph.strokeText("⚽", global.screenWidth - buttonSize, global.screenHeight - buttonSize);
        graph.fillText("⚽", global.screenWidth - buttonSize, global.screenHeight - buttonSize);
        graph.strokeText("🕹", buttonSize, global.screenHeight - buttonSize);
        graph.fillText("🕹", buttonSize, global.screenHeight - buttonSize);
    } else {
        graph.strokeText("⚽", buttonSize, global.screenHeight - buttonSize);
        graph.fillText("⚽", buttonSize, global.screenHeight - buttonSize);
        graph.strokeText("🕹", global.screenWidth - buttonSize, global.screenHeight - buttonSize);
        graph.fillText("🕹️", global.screenWidth - buttonSize, global.screenHeight - buttonSize);
    }
    graph.strokeText("🏃", global.screenWidth - 3 * buttonSize - 10, global.screenHeight - buttonSize);
    graph.fillText("🏃", global.screenWidth - 3 * buttonSize - 10, global.screenHeight - buttonSize);
    fontSize = Math.max(40 / 3, 12);
    graph.font = 'bold ' + fontSize + 'px sans-serif';
}

function drawPlayers() {
    // console.log(c);
    var start = {
        x: player.x - (global.screenWidth / 2),
        y: player.y - (global.screenHeight / 2)
    };
    for (var z = 0; z < users.length; z++) {
        var userCurrent = users[z];
        //console.log(userCurrent.frame);
        var x = 0;
        var y = 0;
        var cellCurrent = userCurrent;
        for (var i = 0; i < usersExpanded.length; i++) {
            if (usersExpanded[i].id == userCurrent.id || usersExpanded[i].id == userCurrent.idz) {
                // console.log(usersExpanded[i]);
                cellCurrent = usersExpanded[i];
                break;
            }
        }
        if (player.x == userCurrent.x && player.y == userCurrent.y) 
            drawGoalDirection(cellCurrent.team);
        
        var points = 30 + ~~ (30 / 5);
        var increase = Math.PI * 2 / points;
        if (cellCurrent.hue != undefined) {
            graph.strokeStyle = 'hsl(' + cellCurrent.hue + ', 40%, 45%)';
            graph.fillStyle = 'hsl(' + cellCurrent.hue + ', 40%, 50%)';
        } else {
            graph.strokeStyle = 'hsl(290, 40%, 45%)';
            graph.fillStyle = 'hsl(290, 40%, 50%)';
        }
        graph.lineWidth = playerConfig.border;

        var xstore = [];
        var ystore = [];

        global.spin += 0.0;

        var circle = {
            x: userCurrent.x - start.x,
            y: userCurrent.y - start.y
        };

        for (let i = 0; i < points; i++) {

            x = 28 * Math.cos(global.spin) + circle.x;
            y = 28 * Math.sin(global.spin) + circle.y;
            if (typeof(userCurrent.id) == "undefined") {
                x = valueInRange(-userCurrent.x + global.screenWidth / 2, global.gameWidth - userCurrent.x + global.screenWidth / 2, x);
                y = valueInRange(-userCurrent.y + global.screenHeight / 2, global.gameHeight - userCurrent.y + global.screenHeight / 2, y);
            } else {
                x = valueInRange(-userCurrent.x - player.x + global.screenWidth / 2 + (40 / 3), global.gameWidth - userCurrent.x + global.gameWidth - player.x + global.screenWidth / 2 - (40 / 3), x);
                y = valueInRange(-userCurrent.y - player.y + global.screenHeight / 2 + (40 / 3), global.gameHeight - userCurrent.y + global.gameHeight - player.y + global.screenHeight / 2 - (40 / 3), y);
            }
            global.spin += increase;
            xstore[i] = x;
            ystore[i] = y;
        }
        for (let i = 0; i < points; ++i) {
            if (i === 0) {
                graph.beginPath();
                graph.moveTo(xstore[i], ystore[i]);
            } else if (i > 0 && i < points - 1) {
                graph.lineTo(xstore[i], ystore[i]);
            } else {
                graph.lineTo(xstore[i], ystore[i]);
                graph.lineTo(xstore[0], ystore[0]);
            }

        }
        graph.lineJoin = 'round';
        graph.lineCap = 'round';
        //graph.fill();
        graph.stroke();
        var nameCell = "";

        if (cellCurrent.name != undefined && cellCurrent.name != null) {
            nameCell = cellCurrent.name;
        } else {
            nameCell = "Loading...";
        }
        if (cellCurrent.name == null) {
            nameCell = "";
        }
        // nameCell = cellCurrent.id;
        var fontSize = 24;
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = 'Black';
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + fontSize + 'px arial';
        var emojiStr = "";
        if (cellCurrent.emoji != -1) {
            switch (cellCurrent.emoji) {
                case 0:
                    emojiStr = "😠";
                    break;
                case 1:
                    emojiStr = "🤔";
                    break;
                case 2:
                    emojiStr = "☝";
                    break;
                case 3:
                    emojiStr = "😂";
                    break;
                case 4:
                    emojiStr = "💩";
                    break;
                case 5:
                    emojiStr = "😁";
                    break;
            }
            //graph.strokeText(emojiStr, circle.x - 20, circle.y - 130);
            graph.fillText(emojiStr, circle.x - 20, circle.y - 130);
        }
        fontSize = 40 / 3;
        graph.fillStyle = playerConfig.textColor;
        graph.font = 'bold ' + fontSize + 'px sans-serif';

        graph.strokeText(nameCell, circle.x, circle.y);
        graph.fillText(nameCell, circle.x, circle.y);
        graph.font = 'bold ' + Math.max(fontSize / 3 * 2, 10) + 'px sans-serif';
        if (nameCell.length === 0) 
            fontSize = 0;
        graph.strokeText(Math.round(30), circle.x, circle.y + fontSize);
        graph.fillText(Math.round(30), circle.x, circle.y + fontSize);

        var srcX;
        var srcY;

        var sheetWidth = 1440;
        var sheetHeight = 1600;

        var cols = 12;
        var rows = 8;

        var width = sheetWidth / cols;
        var height = sheetHeight / rows;

        srcX = (userCurrent.frame % 12) * width;
        srcY = Math.floor(userCurrent.frame / 12) * height;

        // if (cellCurrent.skinsprite != null && cellCurrent.skinsprite != "")
        // graph.drawImage(characterSprites[cellCurrent.skinsprite], srcX, srcY, width,
        // height, circle.x - 60, circle.y - 190, width, height); else
        // graph.drawImage(characterSprites[0], srcX, srcY, width, height, circle.x - 60,
        // circle.y - 170, width, height); var character = new Image(); if
        // (cellCurrent.skinsprite != null && cellCurrent.skinsprite != "")
        // character.src = "../assets/images/" + cellCurrent.skinsprite + ".png"; else
        //   character.src = "../assets/images/0.png"; graph.drawImage(character, srcX,
        // srcY, width, height, circle.x - 60, circle.y
        // - 190, width, height);
    }
    // //the following are to draw a line in the movement direction
    // graph.beginPath(); let deg = 0; let rad = 28; if (player.xoffset != 0) { deg
    // = Math.atan2(player.yoffset, player.xoffset); } else {     deg =
    // player.yoffset >= 0         ? Math.PI / 2         : 3 * Math.PI / 2; }
    // graph.moveTo(global.screenWidth / 2, global.screenHeight / 2);
    // graph.lineTo(global.screenWidth / 2 - rad * Math.cos(deg),
    // global.screenHeight / 2 - rad * Math.sin(deg)); graph.stroke();
}

function valueInRange(min, max, value) {
    return Math.min(max, Math.max(min, value));
}

function drawgoals() {
    graph.fillStyle = 'green';
    graph.fillRect(global.screenWidth / 2 - player.x - 100, (global.screenHeight / 2 - player.y) + (global.gameHeight / 2) - (global.goalWidth / 2), 100, global.goalWidth);
    graph.fillRect(global.gameWidth + global.screenWidth / 2 - player.x, (global.screenHeight / 2 - player.y) + (global.gameHeight / 2) - (global.goalWidth / 2), 100, global.goalWidth);
    graph.strokeStyle = '#FFFFFF';
    let rectTopLeft = {
        x: global.screenWidth / 2 - player.x - 100,
        y: (global.screenHeight / 2 - player.y) + (global.gameHeight / 2) - (global.goalWidth / 2)
    }

    // drawNet(rectTopLeft);
    rectTopLeft = {
        x: global.gameWidth + global.screenWidth / 2 - player.x,
        y: (global.screenHeight / 2 - player.y) + (global.gameHeight / 2) - (global.goalWidth / 2)
    }
    // drawNet(rectTopLeft);
}

function drawNet(rectTopLeft) {
    let netWidth = 15;
    let start = {
        x: rectTopLeft.x,
        y: rectTopLeft.y
    };
    for (let i = 0; i < global.goalWidth; i += netWidth) {
        for (let j = 0; j < 100; j += netWidth) {
            if (i * j != 0) 
                continue;
            graph.beginPath();
            graph.moveTo(start.x + j, start.y + i);
            let cutEnd = {
                x: start.x + 100 + j,
                y: start.y + 100 + i
            }
            if (cutEnd.x > rectTopLeft.x + 100) {
                cutEnd.x = rectTopLeft.x + 100
                cutEnd.y -= j;
            }
            if (cutEnd.y > rectTopLeft.y + global.goalWidth) {
                cutEnd.y = rectTopLeft.y + global.goalWidth;
                cutEnd.x -= i - global.goalWidth + 100;
            }
            graph.lineTo(cutEnd.x, cutEnd.y);
            graph.stroke();
        }
    }
    for (let i = 0; i < global.goalWidth; i += netWidth) {
        for (let j = 0; j < 100; j += netWidth) {
            if (i * j != 0) 
                continue;
            graph.beginPath();
            graph.moveTo(2 * start.x + 100 - (start.x + j), start.y + i);
            let cutEnd = {
                x: start.x + 100 + j,
                y: start.y + 100 + i
            }
            if (cutEnd.x > rectTopLeft.x + 100) {
                cutEnd.x = rectTopLeft.x + 100
                cutEnd.y -= j;
            }
            if (cutEnd.y > rectTopLeft.y + global.goalWidth) {
                cutEnd.y = rectTopLeft.y + global.goalWidth;
                cutEnd.x -= i - global.goalWidth + 100;
            }
            graph.lineTo(2 * start.x + 100 - cutEnd.x, cutEnd.y);
            graph.stroke();
        }
    }
}

function drawGoalText(ball) {
    if (ball.x < 0 || ball.x > global.gameWidth) {
        graph.lineWidth = playerConfig.textBorderSize;
        graph.fillStyle = 'Yellow';
        graph.strokeStyle = playerConfig.textBorder;
        graph.miterLimit = 1;
        graph.lineJoin = 'round';
        graph.textAlign = 'center';
        graph.textBaseline = 'middle';
        graph.font = 'bold ' + 72 + 'px sans-serif';
        var scoringTeam = "";
        if (ball.x < 0) 
            scoringTeam = "RED";
        else 
            scoringTeam = "BLUE";
        graph.strokeText('GOAL! ' + scoringTeam + ' SCORED!', global.screenWidth / 2, global.screenHeight / 2);
        graph.fillText('GOAL! ' + scoringTeam + ' SCORED!', global.screenWidth / 2, global.screenHeight / 2);
        var winners = "";
        if (score.blue == 10) 
            winners = 'BLUE';
        if (score.red == 10) 
            winners = 'RED';
        if (winners != "") {
            graph.strokeText(winners + ' TEAM WON THE GAME!', global.screenWidth / 2, global.screenHeight / 2 + 100);
            graph.fillText(winners + ' TEAM WON THE GAME!', global.screenWidth / 2, global.screenHeight / 2 + 100);
        }
    }
}

function drawborder() {
    graph.lineWidth = 1;
    graph.strokeStyle = playerConfig.borderColor;

    // Big mid circle graph.beginPath(); graph.ellipse(global.gameWidth / 2 +
    // global.screenWidth / 2 - player.x, global.gameHeight / 2 +
    // global.screenHeight / 2 - player.y, 100, 100, 45 * Math.PI / 180, 0, 2 *
    // Math.PI);
    graph.strokeStyle = global.lineColor;
    // graph.stroke();
    drawCircle(global.gameWidth / 2 + global.screenWidth / 2 - player.x, global.gameHeight / 2 + global.screenHeight / 2 - player.y, 100, 50);

    // Mid dot graph.beginPath(); graph.ellipse(global.gameWidth / 2 +
    // global.screenWidth / 2 - player.x, global.gameHeight / 2 +
    // global.screenHeight / 2 - player.y, 2, 2, 45 * Math.PI / 180, 0, 2 *
    // Math.PI); graph.strokeStyle = global.lineColor; graph.stroke(); Mid-vertical
    graph.beginPath();
    graph.moveTo(global.gameWidth / 2 + global.screenWidth / 2 - player.x, 0
        ? player.y > global.screenHeight / 2
        : global.screenHeight / 2 - player.y);
    graph.lineTo(global.gameWidth / 2 + global.screenWidth / 2 - player.x, global.gameHeight + global.screenHeight / 2 - player.y);
    graph.strokeStyle = global.lineColor;
    graph.stroke();

    // Left-vertical.
    if (player.x <= global.screenWidth / 2) {
        graph.beginPath();
        graph.moveTo(global.screenWidth / 2 - player.x, 0
            ? player.y > global.screenHeight / 2
            : global.screenHeight / 2 - player.y);
        graph.lineTo(global.screenWidth / 2 - player.x, global.gameHeight + global.screenHeight / 2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Top-horizontal.
    if (player.y <= global.screenHeight / 2) {
        graph.beginPath();
        graph.moveTo(0
            ? player.x > global.screenWidth / 2
            : global.screenWidth / 2 - player.x, global.screenHeight / 2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth / 2 - player.x, global.screenHeight / 2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Right-vertical.
    if (global.gameWidth - player.x <= global.screenWidth / 2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth / 2 - player.x, global.screenHeight / 2 - player.y);
        graph.lineTo(global.gameWidth + global.screenWidth / 2 - player.x, global.gameHeight + global.screenHeight / 2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }

    // Bottom-horizontal.
    if (global.gameHeight - player.y <= global.screenHeight / 2) {
        graph.beginPath();
        graph.moveTo(global.gameWidth + global.screenWidth / 2 - player.x, global.gameHeight + global.screenHeight / 2 - player.y);
        graph.lineTo(global.screenWidth / 2 - player.x, global.gameHeight + global.screenHeight / 2 - player.y);
        graph.strokeStyle = global.lineColor;
        graph.stroke();
    }
}

function gameLoop() {
    if (!global.disconnected) {
        if (global.gameStart) {
            graph.fillStyle = global.backgroundColor;
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            drawCommercials(comIndex);
            drawborder();
            drawgoals();
            drawBallDirection();
            drawScore(score);
            drawGoalkeeper(goalkeepers);
            drawPlayers();
            drawGoalText(ball);
            drawBall(ball);
            if (global.usingMobileVersion) 
                drawButton();

                // socket.emit('0', target); // playerSendTarget "Heartbeat".

            }
        else {
            graph.fillStyle = '#333333';
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            graph.textAlign = 'center';
            graph.fillStyle = '#FFFFFF';
            graph.font = 'bold 30px sans-serif';
            graph.fillText('Loading...', global.screenWidth / 2, global.screenHeight / 2);
        }
    } else {
        if (!disconnected) {
            disconnected = true; //this is to prevent GPU from working while disconnected
            graph.fillStyle = '#333333';
            graph.fillRect(0, 0, global.screenWidth, global.screenHeight);

            graph.textAlign = 'center';
            graph.fillStyle = '#FFFFFF';
            graph.font = 'bold 30px sans-serif';
            if (global.kicked) {
                if (reason !== '') {
                    graph.fillText('You were disconnected due to ' + reason, global.screenWidth / 2, global.screenHeight / 2 - 20);
                } else {
                    graph.fillText('You were kicked!', global.screenWidth / 2, global.screenHeight / 2);
                }
            } else {
                graph.fillText('Disconnected!', global.screenWidth / 2, global.screenHeight / 2);
            }
        }
    }
}

function comIndexNext() { // rolls commercial signs
    comIndex += 2;
    comIndex = comIndex % global.commercialCount;
}

// setInterval(comIndexNext, 30000);
let looperz = 0;
function animloop() {
    console.log(looperz++);
    gameLoop();
    animLoopHandle = requestAnimationFrame(animloop);
}

class NativeGameScreen extends Component {

    constructor(props) {
        super(props);
        this.cvs = React.createRef();
        this.ctx = '';

        this.state = {
            active: false
        };

        this.onTouchStart = this
            .onTouchStart
            .bind(this);
        this.onTouchEnd = this
            .onTouchEnd
            .bind(this);
        this.onTouchCancel = this
            .onTouchCancel
            .bind(this);
    }

    onTouchStart(event) {
        this.setState({active: true});
        this.props.onPressIn && this
            .props
            .onPressIn();
        start = new Date().getTime();
    }
    onTouchEnd(event) {
        this.setState({active: false});
        this.props.onPressOut && this
            .props
            .onPressOut();
        finish = new Date().getTime();
        let diff = finish - start;
        console.log(diff / ticks);
        ticks = 0;
    }
    onTouchCancel(event) {
        this.setState({active: false});
        this.props.onPressOut && this
            .props
            .onPressOut();
    }
    onTouchMove(event) {
        ticks++;
        let str = '';
        str += '(' + Math.floor(event.nativeEvent.touches[0].locationX) + ',' + Math.floor(event.nativeEvent.touches[0].locationY) + ') ';

        if (event.nativeEvent.touches[1]) 
            str += '(' + Math.floor(event.nativeEvent.touches[1].locationX) + ',' + Math.floor(event.nativeEvent.touches[1].locationY) + ') ';
        
        console.log(str);
    }

    componentDidMount() {
        // canvasHolder = this.cvs;
        // console.log(this.cvs.current.width);
        // this.cvs.current.width = Dimensions
        //     .get('window')
        //     .width;
        // this.cvs.current.height = Dimensions
        //     .get('window')
        //     .height;
        // console.log(this.cvs.current.width);
        // this.ctx = this
        //     .cvs
        //     .current
        //     .getContext('2d');
        // graph = this.ctx;
        // // this.ctx.fillStyle = 'purple'; this     .ctx     .fillRect(0, 0, 100, 100);

        // startGame();

        // // const socket = socketIO('http://10.0.0.5:3002', {     transports:
        // // ['websocket'],     jsonp: false }); socket.connect(); socket.on('connect', ()
        // // => {     console.log('connected to socket server'); });
        // // socket.on('connect_error', () => {     console.log('error while connecting');
        // // });
    }
    handleExit() {
        console.log("handleExit");
        this
            .props
            .navigation
            .navigate('DashboardScreen');
    }

    _onGLContextCreate = (gl) => {
        console.log('here here');
        var ctx = new Expo2DContext(gl);
 
        ctx.fillStyle = "grey";
        ctx.fillRect(20, 40, 100, 100);
        ctx.fillStyle = "white";
        ctx.fillRect(30, 100, 20, 30);
        ctx.fillRect(60, 100, 20, 30);
        ctx.fillRect(90, 100, 20, 30);
        ctx.beginPath();
        ctx.arc(50,70,18,0,2*Math.PI);
        ctx.arc(90,70,18,0,2*Math.PI);
        ctx.fill();
 
        ctx.fillStyle = "grey";
        ctx.beginPath();
        ctx.arc(50,70,8,0,2*Math.PI);
        ctx.arc(90,70,8,0,2*Math.PI);
        ctx.fill();
 
        ctx.strokeStyle = "black";
        ctx.beginPath();
        ctx.moveTo(70,40);
        ctx.lineTo(70,30);
        ctx.arc(70,20,10,0.5*Math.PI,2.5*Math.PI);
        ctx.stroke();
 
        ctx.flush();
    }

    render() {
        return (
            <View style={styles.container}>
                {/* <Canvas ref={this.cvs}/> */}
                <GLView style={{ width:300, height:300 }} onContextCreate={this._onGLContextCreate}/>
            </View>
        );
    }

}

// export default function NativeGameScreen() { //a }

export default NativeGameScreen;

NativeGameScreen.navigationOptions = {
    header: null
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    NativeGameScreenFilename: {
        marginVertical: 7
    }
});
