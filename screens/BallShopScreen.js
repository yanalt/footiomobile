import React, {Component,PureComponent} from 'react';
import axios from 'axios';
import {hostConfig} from '../config';
import {
    Image,
    Platform,
    Button,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    AsyncStorage,
    TextInput,
    FlatList,
    Alert
} from 'react-native';


let xauth = '';
let portraits = [];
let BallShopScreenHolder = {};
let ownedFilteredBalls = [];
let filteredBalls = [];
preload();

async function _storeData(str, val) {
    try {
        await AsyncStorage.setItem(str, val);
    } catch (e) {
        console.log(e);
    }
};

async function _retrieveData(str) {
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

function createAlert(item){
    let title='',message='',content=[];
    if(item.Owned){
        title='Choose';
        message='Are you sure you want to pick ' + item.name + '?';
        content[0]={
            text: 'OK',
            onPress: () => {
                BallShopScreenHolder.OwnedhandleConfirm(item._id);
            }
        }
        content[1]={
            text: 'Cancel',
            onPress: () => console.log("Cancel Pressed")
        }
    }else if(item.price>BallShopScreenHolder.state.creditBalance){
        title='Insufficient coins';
        message='You need more coins to unlock ' + item.name + '...';
        content[0]={
            text: 'OK',
            onPress: () => console.log("OK Pressed")
        }
    }else{
        title='Unlock';
        message='Are you sure you want to unlock ' + item.name + '? You can\'t undo this!';
        content[0]={
            text: 'OK',
            onPress: () => {
                BallShopScreenHolder.handleConfirm(item._id,item.price);
            }
        }
        content[1]={
            text: 'Cancel',
            onPress: () => console.log("Cancel Pressed")
        }
    }

    Alert.alert(
        title,
        message,
        content,
        { cancelable: false }
      );  
}


class BallShopScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCompleted: false,
            searchText: '',
            OwnedsearchText: '',
            balls: [],
            Ownedballs: [],
            creditBalance: 0,
            currentBall: null,
            ballToken: ''
        };
        this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
        BallShopScreenHolder = this;
    }

    _isMounted = false;


    forceUpdateHandler(){
        console.log('refresh');
        // this.forceUpdate();
        this
            .props
            .navigation
            .navigate('ReloadScreen',{page:'BallShopScreen'});
    };


    async componentDidUpdate() {
        await BallAPI.setBalls(this.state.balls);
    }

    componentWillUnmount() {
        this._isMounted = false;
      }

    async componentDidMount() {
        this._isMounted = true;
        xauth = await _retrieveData('x-auth');
        axios({
            method: 'post',
            headers: {
                'x-auth': xauth
            },
            url: hostConfig.address + '/users/skintoken'
        }).then(response => {
            if (this._isMounted)
                this.setState({ballToken: response.headers.ball});
        }).catch((e) => {
            console.log('failed response from balls');
            console.log('err ' + e);
        });
        await BallAPI.getCreditBalance().then(creditBalance => {
            if (this._isMounted)
                this.setState({creditBalance});
            if (creditBalance == null || creditBalance == undefined) { // window.location.hash = '#/';
            }
        }).catch((e) => {
            console.log('err' + e);
        });
        await BallAPI.getBalls().then(balls => {
            if (this._isMounted)
                this.setState({balls});
        }).catch((e) => {
            console.log('err' + e);
        });
        await BallAPI.getCurrentBall().then(currentBall => {
            if (this._isMounted)
                this.setState({currentBall});
        }).catch((e) => {
            console.log('err' + e);
        });
        await BallAPI.getOwnedBalls().then(Ownedballs => {
            if (this._isMounted)                
                this.setState({Ownedballs});
        }).catch((e) => {
            console.log('err' + e);
        });
    }
    async handleConfirm(ballId, price) {
        if (price <= this.state.creditBalance) {
            let currentBall = await axios({
                method: 'post',
                headers: {
                    'x-auth': xauth
                },
                url: hostConfig.address + '/users/purchaseball',
                data: {
                    ballId
                }
            });

            if (this._isMounted)
                this.setState({currentBall});

            await BallAPI.getBalls().then(async balls => { 
                if (this._isMounted){
                    this.setState({balls});
                    await BallAPI.setBalls(balls);}
            }).catch((e) => {
                console.log('err' + e);
            });
            await BallAPI.getCreditBalance().then(creditBalance => {
                if (this._isMounted)
                    this.setState({creditBalance});
            }).catch((e) => {
                console.log('err' + e);
            });

            BallShopScreenHolder.forceUpdateHandler();
        } else {
            // document.getElementById('creditBalanceTitle').style.backgroundColor = "red";
        }
    }
    handleSearch(showCompleted, searchText) {
        if (this._isMounted)
            this.setState({showCompleted: showCompleted, searchText: searchText.toLowerCase()});
    }
    async OwnedhandleConfirm(ballId) {
        try{
            let currentBall = await axios({
                method: 'post',
                headers: {
                    'x-auth': xauth
                },
                url: hostConfig.address + '/users/ballpick',
                data: {
                    ballId
                }
            });
            if(this._isMounted)
                this.setState({currentBall});
            BallShopScreenHolder.forceUpdateHandler();
        }catch(e){
            console.log(e);
        }
        
    }
    OwnedhandleSearch(showCompleted, searchText) {
        if (this._isMounted)
            this.setState({showCompleted: showCompleted, searchText: searchText.toLowerCase()});
    }


    handleExit() {
        console.log("handleExit");
        this
            .props
            .navigation
            .navigate('DashboardScreen');
    }


    render() {
        let {
            balls,
            showCompleted,
            searchText,
            Ownedballs,
            OwnedsearchText,
            creditBalance,
            currentBall
        } = this.state;
        let ActualOwnedBalls = balls.map((ball) => {
            for (let i = 0; i < Ownedballs.length; i++) {
                if (Ownedballs[i].ballId == ball._id) {
                    ball.Owned = true;
                    return ball;
                }
            }
        });
        let ActualBalls = balls.map((ball) => {
            for (let i = 0; i < Ownedballs.length; i++) {
                if (Ownedballs[i].ballId == ball._id) 
                    return null;
                
            }
            return ball;
        });

        filteredBalls = BallAPI.filterBalls(ActualBalls, showCompleted, searchText);
        ownedFilteredBalls = BallAPI.filterBalls(ActualOwnedBalls, showCompleted, searchText);


        if(Array.isArray(ownedFilteredBalls)){
            ownedFilteredBalls.sort((a,b)=>{ 
                return b._id==BallShopScreenHolder.state.currentBall&&a._id!=BallShopScreenHolder.state.currentBall;
            });
        }

       

        return (
            <View style={{
                flex: 1,
                paddingTop:30,
                paddingLeft:30,
                flexDirection: 'row',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
            }}>
                <View style={{width:'40%', paddingRight:'10%'}}>
                    <Text style={{fontSize:30,height:50}}>Locked Balls</Text>
                    <FlatList
                    style={{width:200}}
                    data={filteredBalls}
                    renderItem={( item ) => {return <Item item={item.item}/>}}
                    keyExtractor={item => item.item}
                    />
                </View>


                <View style={{width:'40%', paddingRight:'10%'}}>
                        <Text style={{fontSize:30,height:50}}>Your Balls</Text>
                        <FlatList 
                        style={{width:200}}
                        data={ownedFilteredBalls}
                        renderItem={( item ) => {return <Item item={item.item}/>}}
                        keyExtractor={item => item.item}
                        />
                </View>

                <View>
                    <Text style={{paddingTop:50}}>Coins: 💰{BallShopScreenHolder.state.creditBalance}</Text>
                </View>

                <View
                    style={{
                    position: 'absolute',
                    bottom: '30%',
                    right: 0
                }}>
                    <Button
                        title="Exit!"
                        onPress={() => {
                        this.handleExit()
                    }}/></View>
            </View>
        );
    }
}


export default BallShopScreen;

BallShopScreen.navigationOptions = {
    header: null
};


let BallAPI = {
    setBalls: async function (balls) {
        if (Array.isArray(balls)) {
            await _storeData('balls', JSON.stringify(balls));
            return balls;
        }
    },
    setOwnedBalls: async function (balls) {
        if (Array.isArray(balls)) {
            await _storeData('Ownedballs', JSON.stringify(balls));
            return balls;
        }
    },
    getCreditBalance: async function () {
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/creditbalance',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            return response.data;
        }).catch((e) => {
            console.log('failed response from balls');
            console.log(e);
        });
    },
    updateLastTime: async function () {
        return axios({
            method: 'post',
            url: hostConfig.address + '/users/lasttime',
            headers: {
                'x-auth': xauth
            }
        }).catch((e) => {
            console.log('failed response from lasttime');
            console.log(e);
        });
    },
    getCurrentBall: async function () {
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/currentball',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            return response.data;
        }).catch((e) => {
            console.log('failed response from balls');
            console.log(e);
        });
    },
    getBalls: async function () {
        let balls = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/balls',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            balls = response.data.balls;
            console.log('successful response from balls');
        }).then(() => {
            return balls;
        }).catch((e) => {
            console.log('failed response from balls');
            console.log(e);
            return [];
        });
    },
    getRooms: async function () {
        let rooms = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/rooms'
        }).then(function (response) {
            rooms = response.data;
            console.log('successful response from balls');
        }).then(() => {
            return rooms;
        }).catch((e) => {
            console.log('failed response from balls');
            console.log(e);
        });
    },
    getOwnedBalls: async function () {
        let balls = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/balls',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            balls = response.data;
            console.log('successful response from balls');
        }).then(() => {
            return balls;
        }).catch((e) => {
            console.log('failed response from balls');
            console.log(e);
        });
    },
    filterBalls: function (balls, showCompleted, searchText) {
        let filteredBalls = balls;


        // Filter by searchText
        filteredBalls = filteredBalls.filter((ball) => {
            if (ball != undefined && ball.name != undefined) {
                let name = ball.name.toLowerCase();
                return searchText.length === 0 || name.indexOf(searchText) > -1;
            }
        });


        return filteredBalls;
    }
};





class Item extends PureComponent{
        constructor(props) {
            super(props);
        }
        render(){
            let lockOpacity = 0.4, checkmarkOpacity = 0, coinOpacity = 1, pickText = '💰'+this.props.item.price;
            if(this.props.item.Owned){
                lockOpacity = 0;
                coinOpacity = 0;
                pickText = '   Pick';
            }
            if(this.props.item._id==BallShopScreenHolder.state.currentBall)
                checkmarkOpacity = 0.5;
            
            return (
                <View style={{borderRadius:20,backgroundColor:0x001122,paddingLeft:20, width:190, height: 250}}>
                    <Text>{this.props.item.name}</Text>
                    <View onTouchEnd={()=>createAlert(this.props.item)} style={{paddingTop:18, width:50, height:50, backgroundColor:0x223322, borderRadius:50, position:'absolute',right:10,top:1,flexDirection: 'row',flexWrap: 'wrap',alignItems: 'flex-start'}}>
                        <Text>{pickText}</Text>
                    </View>
                    <Image source = {portraits[this.props.item.sprite]}/>
                    <Image style={{height: 100, width: 100, opacity:lockOpacity, position: 'absolute', top:70, left:30}} source = {require('../assets/img/emojis/lock.png')}/>
                    <Image style={{height: 100, width: 100, opacity:checkmarkOpacity, position: 'absolute', top:70, left:30}} source = {require('../assets/img/emojis/checkmark.png')}/>
                </View>
            );
        }
}




function preload(){
    
    portraits[0]=require('../assets/img/portraits/ball_0.png');
    portraits[1]=require('../assets/img/portraits/ball_1.png');
    portraits[2]=require('../assets/img/portraits/ball_2.png');
    portraits[3]=require('../assets/img/portraits/ball_3.png');
    portraits[4]=require('../assets/img/portraits/ball_4.png');
    portraits[5]=require('../assets/img/portraits/ball_5.png');
    portraits[6]=require('../assets/img/portraits/ball_6.png');
    portraits[7]=require('../assets/img/portraits/ball_7.png');




    
}




