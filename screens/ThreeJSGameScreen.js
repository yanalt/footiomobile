import {GLView} from 'expo-gl';
import * as ScreenOrientation from 'expo-screen-orientation';
import ExpoTHREE, {Renderer} from 'expo-three';
import {Asset} from 'expo-asset';
import * as React from 'react';
import {Audio} from 'expo-av';
import * as FileSystem from 'expo-file-system';
// import AdBar from '../components/AdBar';

import {View,
    Dimensions,Text,Platform,
    AsyncStorage,Image,I18nManager,StatusBar} from 'react-native';
import io from 'socket.io-client';
import {
    Mesh,
    PerspectiveCamera,
    MeshBasicMaterial,
    CircleGeometry,CylinderBufferGeometry,
    Scene,
    Sprite,
    SpriteMaterial,
    RepeatWrapping,
    LineBasicMaterial,
    Vector3,
    LineLoop,
    BufferGeometry,
    Line,
} from 'three';
I18nManager.allowRTL(false);


console.disableYellowBox = true;
console.ignoredYellowBox = ['Setting a timer'];

let instructions = 0;
let timeout;
let reactAppHolder;
let ballImg;
let frames = 0;
let characters = [];
let emojis = [];
let grassTexture;
let goalNet;
let socket;
let startKick = 0;
let comArr = [];
let comIndex = 0;
let celebration = false;
let ballSprite,
    ballMaterial;
let kickSounds = [];
let netSounds = [];
let soundCount = 0;

const scene = new Scene();


let start = new Date().getTime();
let finish = 0;
let fps = 0;

let global = {
    screenWidth: 0,
    screenHeight: 0,
    gameWidth: 2200,
    gameHeight: 1300,
    goalWidth: 400,
    gameStart: false,
    disconnected: false,
    kicked: false,
    camera: null,
    goalkeeperRadius: 40
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

let goalDirection = [];
goalDirection[0] = {
    position: {
        x: 0,
        y: 0
    }
};
let ballDirection = [];
ballDirection[1] = {
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
    x: 0,
    y: 0
};


_retrieveData = async(str) => {
    try {
        const value = await AsyncStorage.getItem(str);
        if (value !== null) {
            // We have data!! console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};

function extractLocalFileName(str){
    let result = '';
    for (let i = 0; i < str.length; i++) {
        if(str[str.length-1-i]=='/')
            break;
        result = str[str.length-1-i] + result;
    }
    // console.log(str);
    return result;
}



async function copyAssetToCacheAsync(assetModule, localFilename) {
    try {
        const localUri = `${
            FileSystem.cacheDirectory
        }asset_${localFilename}`;
        const fileInfo = await FileSystem.getInfoAsync(localUri, {size: false});
        if (! fileInfo.exists) {
            const asset = Asset.fromModule(assetModule);
            await asset.downloadAsync();
            // console.log(`copyAssetToCacheAsync ${
            //     asset.localUri
            // } -> ${localUri}`);
            await FileSystem.copyAsync({from: asset.localUri, to: localUri});
        }
        return localUri;
    } catch (e) {
        console.log('error'+e);
        return assetModule;
    }
}

async function loadTextureSafely(assetModule){
    let uri;
    let texture;
    const asset = Asset.fromModule(assetModule);
    await asset.downloadAsync();
    let localFilename = extractLocalFileName(asset.localUri);
    if(Platform.OS=='android'||Platform.OS=='ios'){
        uri = await copyAssetToCacheAsync(assetModule, localFilename);
        texture = await ExpoTHREE.loadAsync(uri);
        texture.image.data.localUri = texture.image.data.uri;
    }else{
        uri = assetModule;
        texture = await ExpoTHREE.loadAsync(uri);
    }
    return texture;
}


async function changeScreenOrientation() {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_RIGHT);
}

class ThreeJSGameScreen extends React.Component {
    
    // React.useEffect(() => { // Clear the animation loop when the component unmounts
    //     return() => clearTimeout(timeout);
    // }, []);

    constructor(props) {
        super(props);
        this.state = {
           score: {
               blue:0,
               red:0
           },
           goalScoredStyle:{
               opacity: 0
           },
           goalScoredText: '',
           styles : {},
           ip:this.props.navigation.state.params.ip,
           port:this.props.navigation.state.params.port,
        }
        if(this.state.ip=='localhost')
            this.state.ip='10.0.0.5';
        reactAppHolder = this;
    }

    componentWillUnmount(){ //
        clearTimeout(timeout);
        if(socket)
            socket.disconnect();
    }

    componentDidMount(){
        loadCSS(Dimensions.get('window').width,Dimensions.get('window').height);
    }

    handleExit() {
        console.log("handleExit");
        global.disconnected = true;
        socket.close();
        socket = null;

        _retrieveData('x-auth').then((val) => {
            console.log(val);
            if(val){
                reactAppHolder
                    .props
                    .navigation
                    .navigate('DashboardScreen');
            }else{
                reactAppHolder
                    .props
                    .navigation
                    .navigate('LoginScreen');
            }
        }).catch((e) => {
            reactAppHolder
                .props
                .navigation
                .navigate('LoginScreen');
            console.log(e);
        });

    }

    render(){

        return (
            <View onLayout={handleLayout} style={
                {flex: 1}}><GLView style={
                    {flex: 1}
                }
                onContextCreate={handleContextCreate}/>
                {/* <AdBar top="true"/> */}
                <StatusBar hidden />
                
                <View onTouchMove={handleTouchMove} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd} style={reactAppHolder.state.styles.buttonsOverlayCSS}></View>
                <View onTouchMove={handleDirection} style={reactAppHolder.state.styles.directionCSS}><Text style={{fontSize:50, textAlign:'center'}}>🕹</Text></View>
                <View onTouchStart={handleBallKickStart} onTouchEnd={handleBallKickEnd} style={reactAppHolder.state.styles.ballKickCSS}><Text style={{fontSize:50, textAlign:'center'}}>⚽</Text></View>
                <View onTouchStart={handleSprint} style={reactAppHolder.state.styles.sprintCSS}><Text style={{fontSize:50, textAlign:'center'}}>🏃</Text></View>
                {/* <View style={reactAppHolder.state.styles.centerCSS}></View> */}
                <View onTouchStart={this.handleExit} style={reactAppHolder.state.styles.exitCSS}><Text>Exit</Text></View>
                <Image onTouchStart={()=>{handleEmoji(0);}} style={reactAppHolder.state.styles.grinCSS} source={require('../assets/img/emojis/grin.png')}/>
                <Image onTouchStart={()=>{handleEmoji(1);}} style={reactAppHolder.state.styles.angryCSS} source={require('../assets/img/emojis/angry.png')}/>
                <Image onTouchStart={()=>{handleEmoji(2);}} style={reactAppHolder.state.styles.pooCSS} source={require('../assets/img/emojis/poo.png')}/>
                <Image onTouchStart={()=>{handleEmoji(3);}} style={reactAppHolder.state.styles.tongueCSS} source={require('../assets/img/emojis/tongue.png')}/>
                <Image onTouchStart={()=>{handleEmoji(4);}} style={reactAppHolder.state.styles.waveCSS} source={require('../assets/img/emojis/wave.png')}/>
                
                <Text style={reactAppHolder.state.styles.goalScoredCSS}>{
                reactAppHolder.state.goalScoredText
                }</Text>
                <Text style={reactAppHolder.state.styles.scoreCSS}>BLUE {reactAppHolder.state.score.blue} - {reactAppHolder.state.score.red} RED</Text>

                <Text style={reactAppHolder.state.styles.consoleCSS}>{
                    reactAppHolder.state.consoleText
                }</Text>
            </View>
        );
    }
}

// class IconMesh extends Mesh {
//     constructor() {
//         super(new BoxBufferGeometry(1.0, 1.0, 1.0), new MeshStandardMaterial({
//             map: new TextureLoader().load(require('../assets/icon.png')),
//             // color: 0xff0000
//         }));
//     }
// }

function sanityCheck(){
    finish = new Date().getTime();
    fps = 100/((finish-start)/1000);
    console.log('FPS: ' + fps);
    console.log('Instructions per second: ' + (instructions/((finish-start)/1000)));
    start = new Date().getTime();
    instructions = 0;
}

function checkGoal(){
    if(ball.x<0|| ball.x > global.gameWidth){
        instructions+=2;

        let randomIndex = Math.floor(Math.random() * 3);
        if(celebration==false){
            try{
                netSounds[randomIndex].setPositionAsync(0);
                netSounds[randomIndex].setVolumeAsync(0.1);
                netSounds[randomIndex].playAsync();
            }
            catch(e){
                console.log('sound err');
            }
        }

        celebration = true;
        reactAppHolder.setState({
            score: score,
        });
        
        if(ball.x<0){
            reactAppHolder.setState({
                goalScoredText: 'GOAL RED!'
            });
        }
        if(ball.x > global.gameWidth){
            reactAppHolder.setState({
                goalScoredText: 'GOAL BLUE!'
            });
        }

    } else {
        if (celebration){
            reactAppHolder.setState({
                goalScoredText: ''
            });
            celebration = false;
        }
    }
}


function handleSprint(){
    instructions++;
    socket.emit('sprint');
}

function handleLayout(event){
    if(Platform.OS=='android'||Platform.OS=='ios')
        changeScreenOrientation();
    let {x, y, width, height} = event.nativeEvent.layout;
    global.screenWidth=width;
    global.screenHeight=height;
    global.centerY = global.screenHeight-0.075*global.screenWidth-10;
    global.centerX = 0.11*global.screenWidth;
}

function handleDirection(event){
    console.log('1');
    if(global.centerX&&global.centerY){
        instructions++;
        target.x=event.nativeEvent.touches[0].pageX-global.centerX; target.y=event.nativeEvent.touches[0].pageY-global.centerY;
        // let str = ''
        //     str += '(' + Math.floor(event.nativeEvent.touches[0].locationX) + ',' + Math.floor(event.nativeEvent.touches[0].locationY) + ') ';
    }
}

function handleTouchMove(event){
    if(global.centerX&&global.centerY){ //need more than 1.5
        instructions++; // check why it is slow to move down compared to up
        target.x=5*(event.nativeEvent.touches[0].pageX-global.centerX); 
        target.y=5*(event.nativeEvent.touches[0].pageY-global.centerY);
        // let str = '';
        //     str += '(' + Math.floor(event.nativeEvent.touches[0].locationX) + ',' + Math.floor(event.nativeEvent.touches[0].locationY) + ') ';
    }
}

function handleTouchStart(event){
    let currentTouch;
    if(!event.nativeEvent.touches[1])
        currentTouch = event.nativeEvent.touches[0];
    else
        currentTouch = event.nativeEvent.touches[1];

    let x = currentTouch.locationX;
    let leftBorder, rightBorder;

    leftBorder =reactAppHolder.state.styles.grinCSS.left;
    rightBorder = leftBorder + reactAppHolder.state.styles.grinCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        handleEmoji(0);
    }

    leftBorder =reactAppHolder.state.styles.angryCSS.left;
    rightBorder = leftBorder + reactAppHolder.state.styles.angryCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        handleEmoji(1);
    }

    leftBorder =reactAppHolder.state.styles.pooCSS.left;
    rightBorder = leftBorder + reactAppHolder.state.styles.pooCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        handleEmoji(2);
    }

    leftBorder =reactAppHolder.state.styles.tongueCSS.left;
    rightBorder = leftBorder + reactAppHolder.state.styles.tongueCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        handleEmoji(3);
    }

    leftBorder =reactAppHolder.state.styles.waveCSS.left;
    rightBorder = leftBorder + reactAppHolder.state.styles.waveCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        handleEmoji(4);
    }

    leftBorder =reactAppHolder.state.styles.sprintCSS.left;
    rightBorder = leftBorder + reactAppHolder.state.styles.sprintCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        handleSprint();
    }

    leftBorder =reactAppHolder.state.styles.ballKickCSS.left;
    rightBorder = leftBorder + reactAppHolder.state.styles.ballKickCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        handleBallKickStart();
    }

}

function handleBallKickStart(){ 
    instructions++;
    startKick = new Date().getTime();
}

function handleTouchEnd(event){
    let currentTouch = event.nativeEvent;

    let x = currentTouch.locationX;
    let leftBorder =reactAppHolder.state.styles.ballKickCSS.left;
    let rightBorder = leftBorder + reactAppHolder.state.styles.ballKickCSS.width;
    if(x>=leftBorder&&x<rightBorder){
        instructions++;
        let endKick = new Date().getTime();
        let delta = endKick-startKick;
        if(delta>1000)
            delta=1000;
        socket.emit('1',delta/100);
    }

}

function handleBallKickEnd(event){
    instructions++;
    let endKick = new Date().getTime();
    let delta = endKick-startKick;
    if(delta>1000)
        delta=1000
    socket.emit('1',delta/100);
    // window.alert(delta);
    // window.alert('end'); 
}



async function loadTexture(url){
    return new THREE.TextureLoader().load(url);
}

async function handleContextCreate(gl) {
    JUSTloadMyShitUp().then(() => {


        // let time = new Date().getTime();
        // let frames = 0;
        let grassSprite,
            grassMaterial;
        let lineMaterial = new LineBasicMaterial({color: 0xffffff, linewidth: 5}),
            linePoints = [];


        let j = 0;
        const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;
        
        const renderer = new Renderer({gl});
        renderer.setSize(width, height);
        global.screenWidth = width;
        global.screenHeight = height;
        
        const camera = new PerspectiveCamera(70, width / height, 1, 1000);
        global.camera = camera;
        camera.position.set(global.gameWidth / 2, - global.gameHeight / 2, 300);

        linePoints.push(new Vector3(global.gameWidth / 2, 0, 5));
        linePoints.push(new Vector3(global.gameWidth / 2, 0 - global.gameHeight, 5));
        linePoints.push(new Vector3(global.gameWidth, 0 - global.gameHeight,5));
        linePoints.push(new Vector3(global.gameWidth, 0, 5));
        linePoints.push(new Vector3(0, 0, 5));
        linePoints.push(new Vector3(0, 0 - global.gameHeight, 5));
        linePoints.push(new Vector3(global.gameWidth, 0 - global.gameHeight, 5));
        let lineGeometry = new BufferGeometry().setFromPoints(linePoints);
        let line = new Line(lineGeometry, lineMaterial);
        scene.add(line);
        camera.lookAt(global.gameWidth / 2, - global.gameHeight / 2+100, 0);


        global.light = new THREE.PointLight( 0xff00ff,0.5,300 );
        global.light.position.set(100, -200, 300);
        scene.add( global.light );

        grassTexture.wrapT = RepeatWrapping;
        grassTexture.wrapS = RepeatWrapping;
        grassTexture.repeat.x=3;
        grassTexture.repeat.y=3;

        if ((! grassSprite) && grassTexture) {
            let grassGeometry = new THREE.PlaneGeometry( 2200*2, 1300*2);
            let grassMaterial = new THREE.MeshBasicMaterial( {map: grassTexture, color: 0xffff00, side: THREE.DoubleSide} );
            let plane = new THREE.Mesh( grassGeometry, grassMaterial );
            plane.position.set(global.gameWidth / 2, - global.gameHeight / 2, 0);
            scene.add( plane );

        } else {
            console.log('grass failed to load');
        }

        let circleGeo = new CircleGeometry(100, 32);
        circleGeo.vertices.shift();
        let circleMaterial = new LineBasicMaterial({color: 0xffffff, linewidth: 5});
        let midCircle = new LineLoop(circleGeo, circleMaterial);
        midCircle.position.set(global.gameWidth / 2, - global.gameHeight / 2, 5);
        scene.add(midCircle);


        drawgoals();
        function update() {

            if(frames%10==0)
                soundCount=0;
            if(frames%100==0){
                global.startPingTime = Date.now();
                socket.emit('pingcheck');
            }

            movePlayers();
            drawGoalkeepers(goalkeepers);
            drawBall(ball);
            drawBallDirection();
            checkGoal();
            if(socket)
                socket.emit('0', target);
            
            // if(frames%100==0){
            //     reactAppHolder.setState({consoleText: width + 'x' + height});
            //     sanityCheck();
            // }
        }
        // Setup an animation loop
        const loop = () => {
            timeout = requestAnimationFrame(loop);
            update();
            renderer.render(scene, camera);
            gl.endFrameEXP();
            frames++;
            frames = frames % 500;
        };

        loop();
    });


}

function loadCSS(w, h){
    
    let styles ={};
    global.centerY = h-0.1*w-10;
    global.centerX = 0.11*w;
    styles.directionCSS =  {
        position:'absolute',
        bottom:10,
        left:0.02*w, 
        backgroundColor:'black',
        zIndex:90,
        width:0.2*w, 
        height:0.2*w,
        borderRadius:0.2*w, 
        opacity:0.5,  
        paddingVertical:0.08*w
    }
    
    styles.ballKickCSS =  {
        position:'absolute',
        bottom:10,
        left:0.83*w,
        backgroundColor:'black', 
        zIndex:90, 
        width:0.15*w, 
        height:0.15*w,
        borderRadius:0.15*w, 
        opacity:0.5, 
        paddingVertical:0.04*w
    }

    styles.sprintCSS = {
        position:'absolute',
        bottom:10,
        left:0.65*w, 
        backgroundColor:'black', 
        zIndex:90, 
        width:0.15*w, 
        height:0.15*w,
        borderRadius:0.15*w, 
        opacity:0.5, 
        paddingVertical:0.04*w
    }

    styles.centerCSS = {
        position:'absolute',
        top:global.centerY,
        backgroundColor:'red', 
        width:0.01*w, 
        height:0.01*w,
        left:global.centerX, 
        zIndex:100,  
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.exitCSS = {
        position:'absolute',
        backgroundColor:'cyan', 
        opacity:0.6,
        height:0.06*h,
        left:0.6*w,
        bottom:10,
        zIndex:100,  
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.grinCSS = {
        position:'absolute',
        bottom:10,
        width:0.05*w, 
        height:0.05*w,
        left:0.24*w, 
        zIndex:90,  
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.angryCSS = {
        position:'absolute',
        bottom:10,
        width:0.05*w, 
        height:0.05*w,
        left:0.30*w, 
        zIndex:90,  
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.pooCSS = {
        position:'absolute',
        bottom:10,
        width:0.05*w, 
        height:0.05*w,
        left:0.36*w, 
        zIndex:90,  
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.tongueCSS = {
        position:'absolute',
        bottom:10,
        left:0.42*w, 
        width:0.05*w, 
        height:0.05*w, 
        zIndex:90, 
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.waveCSS = {
        position:'absolute',
        bottom:10,
        width:0.05*w, 
        height:0.05*w,
        left:0.48*w, 
        zIndex:90, 
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.goalScoredCSS = {
        position:'absolute',
        color:'yellow',
        fontSize:100,
        bottom:0.3*h,
        width:w, 
        height:0.5*h,
        left:0.1*w, 
        zIndex:90, 
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.scoreCSS = {
        position:'absolute',
        color:'yellow',
        fontSize:30,
        top:0.07*h,
        width:0.5*w, 
        height:0.1*h,
        left:0.07*w, 
        zIndex:90, 
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.consoleCSS = {
        position:'absolute',
        color:'yellow',
        fontSize:20,
        top:0.2*h,
        width:0.5*w, 
        height:0.2*h,
        left:0.4*w, 
        zIndex:90, 
        // MozUserSelect:'none',
        // WebkitUserSelect:'none',
        // msUserSelect:'none',
    }

    styles.buttonsOverlayCSS = {
        position:'absolute',
        backgroundColor:'yellow',
        opacity: 0,
        bottom: 0,
        left:0, 
        width:w, 
        height:0.4*h,
        zIndex:95,
        flex: 1
    }

    reactAppHolder.setState({styles});
}

function startGame() {
    global.playerName = "";
    if (! socket) {
        try{
            console.log('connecting to ' + reactAppHolder.state.ip+':'+reactAppHolder.state.port);
            socket = io.connect(reactAppHolder.state.ip+':'+reactAppHolder.state.port, {
                transports: ['websocket'],
                jsonp: false
            });
            socket.on('connect', () => {
                console.log('connected to socket server');
            });
            socket.on('connect_error',(e)=>{
                console.log(e);
            })
            setupSocket(socket);
        }catch(e){
            console.log(e);
            reactAppHolder.handleExit();
        }
    }

    socket.emit('windowResized',
                {
                    screenWidth:Dimensions.get('window').width,
                    screenHeight:Dimensions.get('window').height,
                });
    socket.emit('respawn');
}

async function setupSocket(socket) { // Handle ping.
    let conf = await _retrieveData('skinToken');
    socket.on('pongcheck', function () {
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
        reactAppHolder.handleExit();
    });

    // Handle connection.
    socket.on('welcome', function (playerSettings) {
        console.log(playerSettings.team);
        player = playerSettings;
        player.name = global.playerName;
        player.screenWidth = global.screenWidth;
        player.screenHeight = global.screenHeight;
        player.target = target;
        player.conf = conf;
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
        let playerData;
        for (let i = 0; i < userData.length; i++) {
            instructions++;
            if (typeof(userData[i].id) == "undefined") {
                playerData = userData[i];
                i = userData.length;
            }
        }
        player.xoffset = player.x - playerData.x;
        player.yoffset = player.y - playerData.y;

        player.x = playerData.x;
        player.y = playerData.y;
        player.xoffset = isNaN(player.xoffset) ? 0 : player.xoffset;
        player.yoffset = isNaN(player.yoffset) ? 0 : player.yoffset;

        users = userData;


        ball = serverBall;
        goalkeepers[0].position = serverGoalkeepers[0].position;
        goalkeepers[1].position = serverGoalkeepers[1].position;
    });

    // slower socket for non-movement information

    socket.on('4', function (serverScore, serverUsers) {

        if (serverScore) {
            if(score.blue==0&&score.red==0)
                reactAppHolder.setState({
                    score:serverScore
                });
            score = serverScore;
        }
        
        
        serverUsers.forEach((u) => {
            for (let i = 0; i < usersExpanded.length; i++) {
                instructions++;
                if (usersExpanded[i].id == u.id) {
                    usersExpanded[i].emoji=u.emoji;
                    if(usersExpanded[i].team != u.team){
                        usersExpanded[i].team = u.team;
                        usersExpanded[i].characterCircle = drawCircle(u.x, - u.y, 28, 32, u.id, u.team ? 'red' : 'blue',false);
                    }
                    
                    return;
                }
            }
            loadCharacterSprites(u).then((res) => {
                usersExpanded.push(res);
            });
        });
        for (let i = 0; i < usersExpanded.length; i++) {
            instructions+=serverUsers.length;
            let found = serverUsers.find(u => u.id==usersExpanded[i].id);
            if(found == undefined){
                console.log('spliced 1');
                scene.remove(usersExpanded[i].characterCircle);
                scene.remove(usersExpanded[i].characterSprite);
                usersExpanded.splice(i, 1);
                break;
            }
        }
    });

    socket.on('playerDisconnect', function (data) {
        for (let i = 0; i < usersExpanded.length; i++) {
            instructions++;
            if (usersExpanded[i].id == data.id){ 
                console.log('spliced 2');
                scene.remove(usersExpanded[i].characterCircle);
                scene.remove(usersExpanded[i].characterSprite);
                usersExpanded.splice(i, 1);
            }
            
        }
    });
    
    socket.on('kick', function (data) {
        global.gameStart = false;
        global.kicked = true;
        socket.close();
    });

    socket.on('kickBall', function () {
        let randomIndex = Math.floor(Math.random() * 3);
        if(soundCount<5){
            try{
                soundCount++;
                kickSounds[randomIndex].setPositionAsync(0);
                kickSounds[randomIndex].setVolumeAsync(0.1);
                kickSounds[randomIndex].playAsync();
            }
            catch(e){
                console.log('err'+e);
            }
        }
    });

    // socket.on('goal', function (data) {     var soundId = "goal" +
    // (Math.floor(Math.random() * (4 - 1)) + 1);    
    // document     .getElementById(soundId)     .volume =     // 0.2; document
    // .getElementById(soundId)     .play(); });

}

function drawCircle(centerX, centerY, radius, sides, name, color, filled) {
    let circleMaterial, circleGeo, circle;
    if(filled){
        circleMaterial = new MeshBasicMaterial( { color: 'gray', transparent: true, opacity: 0.7  } );
        circleGeo = new CylinderBufferGeometry( radius, radius, 1, 32 );
        circle = new Mesh( circleGeo, circleMaterial );
        circle.rotateX(Math.PI/2);
    }
    else{
        circleGeo = new CircleGeometry(radius, sides);
        circleGeo.vertices.shift();
        circleMaterial = new LineBasicMaterial({color: color, linewidth: 5});
        circle = new LineLoop(circleGeo, circleMaterial);
}
    circle.position.set(centerX, centerY, -3);
    circle.name = name;
    scene.add(circle);
    return circle;
}


function drawBall(ball) {
    if (ball.frame==undefined) {
        ball.frame = 0;
    }
    ballImg.offset.x = Math.floor(ball.frame / 10)/10;

    if (ballSprite) {
        ballSprite.position.set(ball.x, - ball.y,10);
    } else if (ballImg) {
        ballMaterial = new SpriteMaterial({
            map: ballImg,
            color: 0xffffff
        });
        ballSprite = new Sprite(ballMaterial); // ballSprite.scale.set(50,50,1);
        ballSprite.position.set(global.gameWidth / 2, - global.gameHeight / 2, 3);
        ballSprite.scale.set(18, 18, 1);
        scene.add(ballSprite);
    }
}

function drawGoalkeepers(goalkeepers) {
    try{
        goalkeepers[0].circle.position.set(goalkeepers[0].position.x, - goalkeepers[0].position.y, 15);
        goalkeepers[1].circle.position.set(goalkeepers[1].position.x, - goalkeepers[1].position.y, 15);
        goalkeepers[0].character.position.set(goalkeepers[0].position.x, - goalkeepers[0].position.y, 15);
        goalkeepers[1].character.position.set(goalkeepers[1].position.x, - goalkeepers[1].position.y, 15);
    }catch{
        if (! goalkeepers[0].circle) 
            goalkeepers[0].circle = drawCircle(goalkeepers[0].position.x, - goalkeepers[0].position.y, global.goalkeeperRadius, 32, 'gk0', 'blue',false);
        
        if (! goalkeepers[1].circle) 
            goalkeepers[1].circle = drawCircle(goalkeepers[1].position.x, - goalkeepers[1].position.y, global.goalkeeperRadius, 32, 'gk1', 'red',false);  
        
        if(! goalkeepers[0].character){
            goalkeepers[0].material = new MeshBasicMaterial({map:goalkeepers[0].img, transparent:true});
            goalkeepers[0].geometry = new THREE.PlaneGeometry( 240, 80);
            goalkeepers[0].character = new THREE.Mesh(goalkeepers[0].geometry,goalkeepers[0].material);
            // goalkeepers[0].character.scale.set(240, 80, 1);
            scene.add(goalkeepers[0].character);
        }

        if(! goalkeepers[1].character){
            goalkeepers[1].material = new MeshBasicMaterial({map:goalkeepers[0].img, transparent:true});
            goalkeepers[1].geometry = new THREE.PlaneGeometry( 240, 80);
            goalkeepers[1].character = new THREE.Mesh(goalkeepers[1].geometry,goalkeepers[1].material);
            // goalkeepers[1].character.scale.set(240, 80, 1);
            scene.add(goalkeepers[1].character);
        }
    }
}

function drawGoalDirection(team) {
    try {
        let distance;
        let emojiDeltaX = 0;
        let emojiDeltaY = 0;
        if (team == 1) {
            distance = Math.sqrt(Math.pow(player.x - 0, 2) + Math.pow((player.y - global.gameHeight / 2), 2)); // only towards left
            if (distance != 0) {
                emojiDeltaX = (0 - player.x * 60) / distance;
                emojiDeltaY = ((global.gameHeight / 2 - player.y) * 60) / distance;
            }
        } else if (team == 0) {
            distance = Math.sqrt(Math.pow(global.gameWidth - player.x, 2) + Math.pow((player.y - global.gameHeight / 2), 2)); // only towards right
            if (distance != 0) {
                emojiDeltaX = ((global.gameWidth - player.x) * 60) / distance;
                emojiDeltaY = ((global.gameHeight / 2 - player.y) * 60) / distance;
            }
        }
        if (emojiDeltaX > 60) 
            emojiDeltaX = 60;
        


        if (emojiDeltaX < -60) 
            emojiDeltaX = -60;
        


        if (emojiDeltaY > 60) 
            emojiDeltaY = 60;
        


        if (emojiDeltaY < -60) 
            emojiDeltaY = -60;
        

        goalDirection.sprite.position.set(player.x + emojiDeltaX, -(player.y + emojiDeltaY), 10);


    } catch {
        if (! goalDirection.sprite) {
            if (goalDirection.img) {
                let goalDirectionMaterial = new SpriteMaterial({map: goalDirection.img, color: 0xffffff});
                goalDirection.sprite = new Sprite(goalDirectionMaterial);
                goalDirection.sprite.position.set(global.gameWidth / 2, - global.gameHeight / 2, 0.5);
                goalDirection.sprite.scale.set(20, 20, 1);
                scene.add(goalDirection.sprite);
            }
        }
    }}

// REMEMBER TO MAKE ALL Y COORDINATES NEGATIVE 


async function loadCharacterSprites(u) {
    if (! u.characterSprite || !u.isActive) {
        let texture = await loadTextureSafely(characters[u.skinsprite]);

        texture.wrapT = RepeatWrapping;
        texture.wrapS = RepeatWrapping;
        texture.repeat.x = 1 / 12;
        texture.repeat.y = 1 / 8;
        u.characterMaterial = new MeshBasicMaterial({map: texture, transparent:true, fog: false});

        u.characterGeometry = new THREE.PlaneGeometry( 120, 200);
        u.characterSprite = new THREE.Mesh( u.characterGeometry, u.characterMaterial );
    
        u.characterSprite.position.set(global.gameWidth / 2, - global.gameHeight / 2, -3);
        u.characterSprite.name = u.id;
        scene.add(u.characterSprite);
    }
    if (! u.emojiSprite) {
        let index = 0;
        if(u.emoji>-1&&u.emoji<emojis.length)
            index = u.emoji;

        u.emojiMaterial = new MeshBasicMaterial({map: emojis[index], transparent:true, fog: false});
        u.emojiGeometry = new THREE.PlaneGeometry( 30, 30);
        u.emojiSprite = new THREE.Mesh( u.emojiGeometry, u.emojiMaterial );

        // u.emojiMaterial = new SpriteMaterial({map: emojis[index], transparent:true, fog: false});
        // u.characterEmoji = new Sprite( u.characterGeometry, u.characterMaterial );
        // u.characterEmoji.scale.set(30, 30, 1);
        u.emojiSprite.position.set(global.gameWidth / 2, - global.gameHeight / 2, -3);
        u.emojiSprite.name = u.id;
        scene.add(u.emojiSprite);
        
    }
    if (! u.characterCircle) {
        u.characterCircle = drawCircle(u.x, - u.y, 28, 32, u.id, u.team ? 'red' : 'blue',false);
        scene.add(u.characterCircle);
    }else{
        u.characterCircle.color = u.team ? 'red' : 'blue';
        u.characterCircle.id = u.id;
    }
    return u;
}

function handleEmoji(index){
    socket.emit('5',index);
}

function drawBallDirection() {
    try {
        if (player.x >= ball.x - 10 && player.x <= ball.x + 10 && player.y >= ball.y - 10 && player.y <= ball.y + 10) {
            ballDirection.sprite.position.set(0, 0, -10);
        } else {
            let distance = Math.sqrt(Math.pow(ball.x - player.x, 2) + Math.pow(ball.y - player.y, 2)); // only towards left
            let emojiDeltaX = 0,
                emojiDeltaY = 0;
            if (distance != 0) {
                emojiDeltaX = ((ball.x - player.x) * 60) / distance;
                emojiDeltaY = ((ball.y - player.y) * 60) / distance;
            }
            ballDirection.sprite.position.set(emojiDeltaX + player.x, -(emojiDeltaY + player.y), 10);
        }
    } catch {
        if (! ballDirection.sprite) {
            if (ballDirection.img) {
                let ballDirectionMaterial = new SpriteMaterial({map: ballDirection.img, color: 0xffffff});
                ballDirection.sprite = new Sprite(ballDirectionMaterial);
                ballDirection.sprite.position.set(global.gameWidth / 2, - global.gameHeight / 2, 0.5);
                ballDirection.sprite.scale.set(10, 10,1);
                scene.add(ballDirection.sprite);
            }
        }
    }}









function movePlayers() {
    // drawBallDirection();
    // drawGoalDirection();
    if (global.camera) 
        global.camera.position.set(player.x,-player.y-100, 300);
    if (global.light) 
        global.light.position.set(player.x,-player.y-100, 300);
    
    for (let i = 0; i < users.length; i++) {
        instructions+=6;
        let currentExpanded;
        for (let j = 0; j < usersExpanded.length; j++) {
            instructions++;
            if (usersExpanded[j].id == users[i].id || usersExpanded[j].id == users[i].idz) {
                currentExpanded = usersExpanded[j];
                if(player.x==users[i].x&&player.y==users[i].y){
                    drawGoalDirection(currentExpanded.team);}
                break;
            }
        }
        if (currentExpanded && currentExpanded.characterSprite && currentExpanded.characterCircle) {
            currentExpanded.characterSprite.position.set(users[i].x, - users[i].y + 100, 10);
            currentExpanded.characterCircle.position.set(users[i].x, - users[i].y, 10);
            let index = currentExpanded.emoji;
            if(index===0||(index&&index!=-1)){
                currentExpanded.emojiMaterial.map = emojis[index];
                currentExpanded.emojiSprite.position.set(users[i].x + 30, - users[i].y +110, (currentExpanded.emoji==-1?-10:10));
            }else{
                currentExpanded.emojiSprite.position.set(users[i].x + 20, - users[i].y +50, -10);
            }
            currentExpanded.characterMaterial.map.offset.x = (users[i].frame % 12) * 1 / 12;
            currentExpanded.characterMaterial.map.offset.y = -1 / 8 - Math.floor(users[i].frame / 12) * 1 / 8;
        }
        // handle animation...

        // draw name
        // draw emoji
    }
}

// function valueInRange(min, max, value) {
//     return Math.min(max, Math.max(min, value));
// }

function drawgoals() {
    instructions++;
    let material1 = new THREE.MeshBasicMaterial({map:goalNet,transparent: true, side: THREE.DoubleSide});
    let material2 = new THREE.MeshBasicMaterial({map:goalNet,transparent: true, side: THREE.DoubleSide});
    let material3 = new THREE.MeshBasicMaterial({map:grassTexture,transparent: false, side: THREE.DoubleSide});

    let materialTransparent = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, wireframe: true});
    let geometry = new THREE.BoxBufferGeometry(200, global.goalWidth, 90);

    let materials = [
        materialTransparent,
        material1,
        material2,
        material2,
        material2,
        materialTransparent,
    ];

    let goal1 = new THREE.Mesh(geometry, materials);
    goal1.position.set(0-100,-global.gameHeight/2,50);
    scene.add(goal1);

    materials = [
        material1,
        materialTransparent,
        material2,
        material2,
        material2,
        materialTransparent,
    ];

    let goal2 = new THREE.Mesh(geometry, materials);
    goal2.position.set(global.gameWidth+100,-global.gameHeight/2,50);
    scene.add(goal2);
}



// function drawCommercials(index) {
//     var comDiv = 8;
//     var comHeight = 70;
//     for (var i = 0; i < comDiv; i++) {
//         var x = global.screenWidth / 2 - player.x + i * global.gameWidth / comDiv;
//         var y = global.screenHeight / 2 - player.y - comHeight;
//         // graph.drawImage(comArr[index + i % 2], x, y, global.gameWidth / comDiv,
//         // comHeight);
//     }

//     for (let i = 0; i < comDiv; i++) {
//         var a = global.screenWidth / 2 - player.x + i * global.gameWidth / comDiv;
//         var b = global.gameHeight + global.screenHeight / 2 - player.y;
//         // graph.drawImage(comArr[index + i % 2], a, b, global.gameWidth / comDiv,
//         // comHeight);
//     }
// }



// function comIndexNext() { // rolls commercial signs
//     comIndex += 2;
//     comIndex = comIndex % global.commercialCount;
// }

async function JUSTloadMyShitUp() {
    startGame();
    instructions++;
    try{


        grassTexture = await loadTextureSafely(require('../assets/img/grass.jpeg'));

        // let src = Asset.fromModule(require('../assets/img/grass.jpeg'));
        // if(src){
        //     await loadTextureAsync({asset:src}).then((res)=>{
        //             socket.emit('err',src);
        //             grassTexture=res;
                
        //     }).catch((e)=>{
        //         console.log('fgt'+e);
        //     });
        // }

        goalNet = await loadTextureSafely(require('../assets/img/net.png'));
        emojis[0] = await loadTextureSafely(require('../assets/img/emojis/grin.png'));
        emojis[1] = await loadTextureSafely(require('../assets/img/emojis/angry.png'));
        emojis[2] = await loadTextureSafely(require('../assets/img/emojis/poo.png'));
        emojis[3] = await loadTextureSafely(require('../assets/img/emojis/tongue.png'));
        emojis[4] = await loadTextureSafely(require('../assets/img/emojis/wave.png'));
        
        // await loadAsync(require('../assets/img/net.png')).then((res) => {
        //     goalNet = res;
        // });

        // await loadAsync(require('../assets/img/emojis/grin.png')).then((res) => {
        //     emojis[0] = res;
        // });
        // await loadAsync(require('../assets/img/emojis/angry.png')).then((res) => {
        //     emojis[1] = res;
        // });
        // await loadAsync(require('../assets/img/emojis/poo.png')).then((res) => {
        //     emojis[2] = res;
        // });
        // await loadAsync(require('../assets/img/emojis/tongue.png')).then((res) => {
        //     emojis[3] = res;
        // });
        // await loadAsync(require('../assets/img/emojis/wave.png')).then((res) => {
        //     emojis[4] = res;
        // });

        characters[0] = require('../assets/img/0.png');
        characters[1] = require('../assets/img/1.png');
        characters[2] = require('../assets/img/2.png');
        characters[3] = require('../assets/img/3.png');
        characters[4] = require('../assets/img/4.png');
        characters[5] = require('../assets/img/5.png');
        characters[6] = require('../assets/img/6.png');
        characters[7] = require('../assets/img/7.png');
        characters[8] = require('../assets/img/8.png');
        characters[9] = require('../assets/img/9.png');

        characters[10] = require('../assets/img/10.png');
        characters[11] = require('../assets/img/11.png');
        characters[12] = require('../assets/img/12.png');
        characters[13] = require('../assets/img/13.png');
        characters[14] = require('../assets/img/14.png');
        characters[15] = require('../assets/img/15.png');
        characters[16] = require('../assets/img/16.png');
        characters[17] = require('../assets/img/17.png');
        characters[18] = require('../assets/img/18.png');
        characters[19] = require('../assets/img/19.png');

        characters[20] = require('../assets/img/20.png');
        characters[21] = require('../assets/img/21.png');
        characters[22] = require('../assets/img/22.png');
        characters[23] = require('../assets/img/23.png');
        characters[24] = require('../assets/img/24.png');
        characters[25] = require('../assets/img/25.png');
        characters[26] = require('../assets/img/26.png');
        characters[27] = require('../assets/img/27.png');
        characters[28] = require('../assets/img/28.png');
        characters[29] = require('../assets/img/29.png');

        characters[30] = require('../assets/img/30.png');
        characters[31] = require('../assets/img/31.png');
        characters[32] = require('../assets/img/32.png');
        characters[33] = require('../assets/img/33.png');
        characters[34] = require('../assets/img/34.png');
        characters[35] = require('../assets/img/35.png');
        characters[36] = require('../assets/img/36.png');
        characters[37] = require('../assets/img/37.png');
        characters[38] = require('../assets/img/38.png');
        characters[39] = require('../assets/img/39.png');

        characters[40] = require('../assets/img/40.png');

        goalDirection.img = await loadTextureSafely(require('../assets/img/emojis/goal.png'));
        ballDirection.img = await loadTextureSafely(require('../assets/img/emojis/ball.png'));
        goalkeepers[0].img = await loadTextureSafely(require('../assets/img/goalkeeper.png'));
        ballImg = await loadTextureSafely(require('../assets/img/ball_0.png'));
        ballImg.wrapT = ballImg.wrapS = RepeatWrapping;
        ballImg.repeat.set( 1 / 10, 1 );

        // await loadAsync(require('../assets/img/emojis/goal.png')).then((res) => {
        //     goalDirection.img = res;
        // });

        // await loadAsync(require('../assets/img/emojis/ball.png')).then((res) => {
        //     ballDirection.img = res;
        // });

        // await loadAsync(require('../assets/img/goalkeeper.png')).then((res) => {
        //     goalkeepers[0].img = res;
        // });

        // await loadAsync(require('../assets/img/ball_0.png')).then((res) => {
        //     ballImg = res;
        //     ballImg.wrapT = ballImg.wrapS = RepeatWrapping;
        //     ballImg.repeat.set( 1 / 10, 1 );
        // });




        kickSounds[0] = new Audio.Sound();
        await kickSounds[0].loadAsync(require('../assets/audio/kick0.mp3'));
        await kickSounds[0].setVolumeAsync(0.1);
        kickSounds[1] = new Audio.Sound();
        await kickSounds[1].loadAsync(require('../assets/audio/kick1.mp3'));
        await kickSounds[1].setVolumeAsync(0.1);
        kickSounds[2] = new Audio.Sound();
        await kickSounds[2].loadAsync(require('../assets/audio/kick2.mp3'));
        await kickSounds[2].setVolumeAsync(0.1);
        
        netSounds[0] = new Audio.Sound();
        await netSounds[0].loadAsync(require('../assets/audio/net0.mp3'));
        await netSounds[0].setVolumeAsync(0.1);
        netSounds[1] = new Audio.Sound();
        await netSounds[1].loadAsync(require('../assets/audio/net1.mp3'));
        await netSounds[1].setVolumeAsync(0.1);
        netSounds[2] = new Audio.Sound();
        await netSounds[2].loadAsync(require('../assets/audio/net2.mp3'));
        await netSounds[2].setVolumeAsync(0.1);


    }catch(e){
        console.log('err ' + e);
        // socket.emit('err',e);
    }
}

export default ThreeJSGameScreen;

ThreeJSGameScreen.navigationOptions = {
    header: null
};






