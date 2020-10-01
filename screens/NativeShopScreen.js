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
let portraits = [], flags = [];
let NativeShopScreenHolder = {};
let ownedFilteredSkins = [];
let filteredSkins = [];
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
                NativeShopScreenHolder.OwnedhandleConfirm(item._id);
            }
        }
        content[1]={
            text: 'Cancel',
            onPress: () => console.log("Cancel Pressed")
        }
    }else if(item.price>NativeShopScreenHolder.state.creditBalance){
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
                NativeShopScreenHolder.handleConfirm(item._id,item.price);
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


class NativeShopScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCompleted: false,
            searchText: '',
            OwnedsearchText: '',
            skins: [],
            Ownedskins: [],
            creditBalance: 0,
            currentSkin: null,
            skinToken: ''
        };
        this.forceUpdateHandler = this.forceUpdateHandler.bind(this);
        NativeShopScreenHolder = this;
    }

    _isMounted = false;


    forceUpdateHandler(){
        console.log('refresh');
        // this.forceUpdate();
        this
            .props
            .navigation
            .navigate('ReloadScreen');
    };


    async componentDidUpdate() {
        await SkinAPI.setSkins(this.state.skins);
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
                this.setState({skinToken: response.headers.skin});
        }).catch((e) => {
            console.log('failed response from skins');
            console.log('err' + e);
        });
        await SkinAPI.getCreditBalance().then(creditBalance => {
            if (this._isMounted)
                this.setState({creditBalance});
            if (creditBalance == null || creditBalance == undefined) { // window.location.hash = '#/';
            }
        }).catch((e) => {
            console.log('err' + e);
        });
        await SkinAPI.getSkins().then(skins => {
            if (this._isMounted)
                this.setState({skins});
        }).catch((e) => {
            console.log('err' + e);
        });
        await SkinAPI.getCurrentSkin().then(currentSkin => {
            if (this._isMounted)
                this.setState({currentSkin});
        }).catch((e) => {
            console.log('err' + e);
        });
        await SkinAPI.getOwnedSkins().then(Ownedskins => {
            if (this._isMounted)                
                this.setState({Ownedskins});
        }).catch((e) => {
            console.log('err' + e);
        });
    }
    async handleConfirm(skinId, price) {
        if (price <= this.state.creditBalance) {
            await axios({
                method: 'post',
                headers: {
                    'x-auth': xauth
                },
                url: hostConfig.address + '/users/purchase',
                data: {
                    skinId
                }
            });

            await SkinAPI.getSkins().then(async skins => { 
                if (this._isMounted){
                    this.setState({skins});
                    await SkinAPI.setSkins(skins);}
            }).catch((e) => {
                console.log('err' + e);
            });
            await SkinAPI.getCreditBalance().then(creditBalance => {
                if (this._isMounted)
                    this.setState({creditBalance});
            }).catch((e) => {
                console.log('err' + e);
            });
            await SkinAPI.getCurrentSkin().then(currentSkin => {
                if (this._isMounted)
                    this.setState({currentSkin});
            }).catch((e) => {
                console.log('err' + e);
            });
            NativeShopScreenHolder.forceUpdateHandler();
        } else {
            // document.getElementById('creditBalanceTitle').style.backgroundColor = "red";
        }
    }
    handleSearch(showCompleted, searchText) {
        if (this._isMounted)
            this.setState({showCompleted: showCompleted, searchText: searchText.toLowerCase()});
    }
    async OwnedhandleConfirm(skinId) {
        await axios({
            method: 'post',
            headers: {
                'x-auth': xauth
            },
            url: hostConfig.address + '/users/skinpick',
            data: {
                skinId
            }
        });
        await SkinAPI.getCurrentSkin().then(currentSkin => {
            if (this._isMounted)
                this.setState({currentSkin});
        }).then(() => {
            NativeShopScreenHolder.forceUpdateHandler();
        }).catch((e) => {
            console.log('err' + e);
        });
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
            skins,
            showCompleted,
            searchText,
            Ownedskins,
            OwnedsearchText,
            creditBalance,
            currentSkin
        } = this.state;
        let ActualOwnedSkins = skins.map((skin) => {
            for (let i = 0; i < Ownedskins.length; i++) {
                if (Ownedskins[i].skinId == skin._id) {
                    skin.Owned = true;
                    return skin;
                }
            }
        });
        let ActualSkins = skins.map((skin) => {
            for (let i = 0; i < Ownedskins.length; i++) {
                if (Ownedskins[i].skinId == skin._id) 
                    return null;
                
            }
            return skin;
        });

        filteredSkins = SkinAPI.filterSkins(ActualSkins, showCompleted, searchText);
        ownedFilteredSkins = SkinAPI.filterSkins(ActualOwnedSkins, showCompleted, searchText);


        if(Array.isArray(ownedFilteredSkins)){
            ownedFilteredSkins.sort((a,b)=>{ 
                return b._id==NativeShopScreenHolder.state.currentSkin&&a._id!=NativeShopScreenHolder.state.currentSkin;
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
                    <Text style={{fontSize:30,height:50}}>Locked Skins</Text>
                    <FlatList
                    style={{width:200}}
                    data={filteredSkins}
                    renderItem={( item ) => {return <Item item={item.item}/>}}
                    keyExtractor={item => item.item}
                    />
                </View>


                <View style={{width:'40%', paddingRight:'10%'}}>
                        <Text style={{fontSize:30,height:50}}>Your Skins</Text>
                        <FlatList 
                        style={{width:200}}
                        data={ownedFilteredSkins}
                        renderItem={( item ) => {return <Item item={item.item}/>}}
                        keyExtractor={item => item.item}
                        />
                </View>

                <View>
                    <Text style={{paddingTop:50}}>Coins: 💰{NativeShopScreenHolder.state.creditBalance}</Text>
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


export default NativeShopScreen;

NativeShopScreen.navigationOptions = {
    header: null
};


let SkinAPI = {
    setSkins: async function (skins) {
        if (Array.isArray(skins)) {
            await _storeData('skins', JSON.stringify(skins));
            return skins;
        }
    },
    setOwnedSkins: async function (skins) {
        if (Array.isArray(skins)) {
            await _storeData('Ownedskins', JSON.stringify(skins));
            return skins;
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
            console.log('failed response from skins');
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
    getCurrentSkin: async function () {
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/currentskin',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            return response.data;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    getSkins: async function () {
        let skins = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/skins',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            skins = response.data.skins;
            console.log('successful response from skins');
        }).then(() => {
            return skins;
        }).catch((e) => {
            console.log('failed response from skins');
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
            console.log('successful response from skins');
        }).then(() => {
            return rooms;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    getOwnedSkins: async function () {
        let skins = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/skins',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            skins = response.data;
            console.log('successful response from skins');
        }).then(() => {
            return skins;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    filterSkins: function (skins, showCompleted, searchText) {
        let filteredSkins = skins;


        // Filter by searchText
        filteredSkins = filteredSkins.filter((skin) => {
            if (skin != undefined && skin.name != undefined) {
                let name = skin.name.toLowerCase();
                return searchText.length === 0 || name.indexOf(searchText) > -1;
            }
        });


        return filteredSkins;
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
            if(this.props.item._id==NativeShopScreenHolder.state.currentSkin)
                checkmarkOpacity = 0.5;
            
            return (
                <View style={{borderRadius:20,backgroundColor:0x001122,paddingLeft:20, width:190, height: 250}}>
                    <Text>{this.props.item.name}</Text>
                    <View onTouchEnd={()=>createAlert(this.props.item)} style={{paddingTop:18, width:50, height:50, backgroundColor:0x223322, borderRadius:50, position:'absolute',right:10,top:1,flexDirection: 'row',flexWrap: 'wrap',alignItems: 'flex-start'}}>
                        <Text>{pickText}</Text>
                    </View>
                    <Image source = {flags[this.props.item.sprite]}/>
                    <Image source = {portraits[this.props.item.sprite]}/>
                    <Image style={{height: 100, width: 100, opacity:lockOpacity, position: 'absolute', top:70, left:30}} source = {require('../assets/img/emojis/lock.png')}/>
                    <Image style={{height: 100, width: 100, opacity:checkmarkOpacity, position: 'absolute', top:70, left:30}} source = {require('../assets/img/emojis/checkmark.png')}/>
                </View>
            );
        }
}




function preload(){
    
    portraits[0]=require('../assets/img/portraits/0.png');
    portraits[1]=require('../assets/img/portraits/1.png');
    portraits[2]=require('../assets/img/portraits/2.png');
    portraits[3]=require('../assets/img/portraits/3.png');
    portraits[4]=require('../assets/img/portraits/4.png');
    portraits[5]=require('../assets/img/portraits/5.png');
    portraits[6]=require('../assets/img/portraits/6.png');
    portraits[7]=require('../assets/img/portraits/7.png');
    portraits[8]=require('../assets/img/portraits/8.png');
    portraits[9]=require('../assets/img/portraits/9.png');

    portraits[10]=require('../assets/img/portraits/10.png');
    portraits[11]=require('../assets/img/portraits/11.png');
    portraits[12]=require('../assets/img/portraits/12.png');
    portraits[13]=require('../assets/img/portraits/13.png');
    portraits[14]=require('../assets/img/portraits/14.png');
    portraits[15]=require('../assets/img/portraits/15.png');
    portraits[16]=require('../assets/img/portraits/16.png');
    portraits[17]=require('../assets/img/portraits/17.png');
    portraits[18]=require('../assets/img/portraits/18.png');
    portraits[19]=require('../assets/img/portraits/19.png');

    portraits[20]=require('../assets/img/portraits/20.png');
    portraits[21]=require('../assets/img/portraits/21.png');
    portraits[22]=require('../assets/img/portraits/22.png');
    portraits[23]=require('../assets/img/portraits/23.png');
    portraits[24]=require('../assets/img/portraits/24.png');
    portraits[25]=require('../assets/img/portraits/25.png');
    portraits[26]=require('../assets/img/portraits/26.png');
    portraits[27]=require('../assets/img/portraits/27.png');
    portraits[28]=require('../assets/img/portraits/28.png');
    portraits[29]=require('../assets/img/portraits/29.png');

    portraits[30]=require('../assets/img/portraits/30.png');
    portraits[31]=require('../assets/img/portraits/31.png');
    portraits[32]=require('../assets/img/portraits/32.png');
    portraits[33]=require('../assets/img/portraits/33.png');
    portraits[34]=require('../assets/img/portraits/34.png');
    portraits[35]=require('../assets/img/portraits/35.png');
    portraits[36]=require('../assets/img/portraits/36.png');
    portraits[37]=require('../assets/img/portraits/37.png');
    portraits[38]=require('../assets/img/portraits/38.png');
    portraits[39]=require('../assets/img/portraits/39.png');

    portraits[40]=require('../assets/img/portraits/40.png');
    portraits[41]=require('../assets/img/portraits/41.png');
    portraits[42]=require('../assets/img/portraits/42.png');
    portraits[43]=require('../assets/img/portraits/43.png');
    portraits[44]=require('../assets/img/portraits/44.png');
    portraits[45]=require('../assets/img/portraits/45.png');
    portraits[46]=require('../assets/img/portraits/46.png');
    portraits[47]=require('../assets/img/portraits/47.png');
    portraits[48]=require('../assets/img/portraits/48.png');
    portraits[49]=require('../assets/img/portraits/49.png');

    portraits[50]=require('../assets/img/portraits/50.png');
    portraits[51]=require('../assets/img/portraits/51.png');
    portraits[52]=require('../assets/img/portraits/52.png');
    portraits[53]=require('../assets/img/portraits/53.png');
    portraits[54]=require('../assets/img/portraits/54.png');
    portraits[55]=require('../assets/img/portraits/55.png');
    portraits[56]=require('../assets/img/portraits/56.png');
    portraits[57]=require('../assets/img/portraits/57.png');
    portraits[58]=require('../assets/img/portraits/58.png');
    portraits[59]=require('../assets/img/portraits/59.png');

    portraits[60]=require('../assets/img/portraits/60.png');
    portraits[61]=require('../assets/img/portraits/61.png');
    portraits[62]=require('../assets/img/portraits/62.png');
    portraits[63]=require('../assets/img/portraits/63.png');
    portraits[64]=require('../assets/img/portraits/64.png');
    portraits[65]=require('../assets/img/portraits/65.png');
    portraits[66]=require('../assets/img/portraits/66.png');
    portraits[67]=require('../assets/img/portraits/67.png');
    portraits[68]=require('../assets/img/portraits/68.png');
    portraits[69]=require('../assets/img/portraits/69.png');

    portraits[70]=require('../assets/img/portraits/70.png');
    portraits[71]=require('../assets/img/portraits/71.png');
    portraits[72]=require('../assets/img/portraits/72.png');
    portraits[73]=require('../assets/img/portraits/73.png');
    portraits[74]=require('../assets/img/portraits/74.png');
    portraits[75]=require('../assets/img/portraits/75.png');
    portraits[76]=require('../assets/img/portraits/76.png');
    portraits[77]=require('../assets/img/portraits/77.png');
    portraits[78]=require('../assets/img/portraits/78.png');
    portraits[79]=require('../assets/img/portraits/79.png');

    portraits[80]=require('../assets/img/portraits/80.png');
    portraits[81]=require('../assets/img/portraits/81.png');
    portraits[82]=require('../assets/img/portraits/82.png');
    portraits[83]=require('../assets/img/portraits/83.png');
    portraits[84]=require('../assets/img/portraits/84.png');
    portraits[85]=require('../assets/img/portraits/85.png');
    portraits[86]=require('../assets/img/portraits/86.png');
    portraits[87]=require('../assets/img/portraits/87.png');
    portraits[88]=require('../assets/img/portraits/88.png');
    portraits[89]=require('../assets/img/portraits/89.png');

    portraits[90]=require('../assets/img/portraits/90.png');
    portraits[91]=require('../assets/img/portraits/91.png');
    portraits[92]=require('../assets/img/portraits/92.png');
    portraits[93]=require('../assets/img/portraits/93.png');
    portraits[94]=require('../assets/img/portraits/94.png');
    portraits[95]=require('../assets/img/portraits/95.png');
    portraits[96]=require('../assets/img/portraits/96.png');
    portraits[97]=require('../assets/img/portraits/97.png');
    portraits[98]=require('../assets/img/portraits/98.png');
    portraits[99]=require('../assets/img/portraits/99.png');

    portraits[100]=require('../assets/img/portraits/100.png');
    portraits[101]=require('../assets/img/portraits/101.png');
    portraits[102]=require('../assets/img/portraits/102.png');
    portraits[103]=require('../assets/img/portraits/103.png');
    portraits[104]=require('../assets/img/portraits/104.png');
    portraits[105]=require('../assets/img/portraits/105.png');
    portraits[106]=require('../assets/img/portraits/106.png');
    portraits[107]=require('../assets/img/portraits/107.png');
    portraits[108]=require('../assets/img/portraits/108.png');
    portraits[109]=require('../assets/img/portraits/109.png');

    portraits[110]=require('../assets/img/portraits/110.png');
    portraits[111]=require('../assets/img/portraits/111.png');
    portraits[112]=require('../assets/img/portraits/112.png');
    portraits[113]=require('../assets/img/portraits/113.png');
    portraits[114]=require('../assets/img/portraits/114.png');
    portraits[115]=require('../assets/img/portraits/115.png');
    portraits[116]=require('../assets/img/portraits/116.png');
    portraits[117]=require('../assets/img/portraits/117.png');
    portraits[118]=require('../assets/img/portraits/118.png');
    portraits[119]=require('../assets/img/portraits/119.png');

    portraits[120]=require('../assets/img/portraits/120.png');
    portraits[121]=require('../assets/img/portraits/121.png');
    portraits[122]=require('../assets/img/portraits/122.png');
    portraits[123]=require('../assets/img/portraits/123.png');
    portraits[124]=require('../assets/img/portraits/124.png');
    portraits[125]=require('../assets/img/portraits/125.png');
    portraits[126]=require('../assets/img/portraits/126.png');
    portraits[127]=require('../assets/img/portraits/127.png');
    portraits[128]=require('../assets/img/portraits/128.png');
    portraits[129]=require('../assets/img/portraits/129.png');

    portraits[130]=require('../assets/img/portraits/130.png');
    portraits[131]=require('../assets/img/portraits/131.png');
    portraits[132]=require('../assets/img/portraits/132.png');
    portraits[133]=require('../assets/img/portraits/133.png');
    portraits[134]=require('../assets/img/portraits/134.png');
    portraits[135]=require('../assets/img/portraits/135.png');
    portraits[136]=require('../assets/img/portraits/136.png');
    portraits[137]=require('../assets/img/portraits/137.png');












    
    flags[0]=require('../assets/img/flags/0.png');
    flags[1]=require('../assets/img/flags/1.png');
    flags[2]=require('../assets/img/flags/2.png');
    flags[3]=require('../assets/img/flags/3.png');
    flags[4]=require('../assets/img/flags/4.png');
    flags[5]=require('../assets/img/flags/5.png');
    flags[6]=require('../assets/img/flags/6.png');
    flags[7]=require('../assets/img/flags/7.png');
    flags[8]=require('../assets/img/flags/8.png');
    flags[9]=require('../assets/img/flags/9.png');

    flags[10]=require('../assets/img/flags/10.png');
    flags[11]=require('../assets/img/flags/11.png');
    flags[12]=require('../assets/img/flags/12.png');
    flags[13]=require('../assets/img/flags/13.png');
    flags[14]=require('../assets/img/flags/14.png');
    flags[15]=require('../assets/img/flags/15.png');
    flags[16]=require('../assets/img/flags/16.png');
    flags[17]=require('../assets/img/flags/17.png');
    flags[18]=require('../assets/img/flags/18.png');
    flags[19]=require('../assets/img/flags/19.png');

    flags[20]=require('../assets/img/flags/20.png');
    flags[21]=require('../assets/img/flags/21.png');
    flags[22]=require('../assets/img/flags/22.png');
    flags[23]=require('../assets/img/flags/23.png');
    flags[24]=require('../assets/img/flags/24.png');
    flags[25]=require('../assets/img/flags/25.png');
    flags[26]=require('../assets/img/flags/26.png');
    flags[27]=require('../assets/img/flags/27.png');
    flags[28]=require('../assets/img/flags/28.png');
    flags[29]=require('../assets/img/flags/29.png');

    flags[30]=require('../assets/img/flags/30.png');
    flags[31]=require('../assets/img/flags/31.png');
    flags[32]=require('../assets/img/flags/32.png');
    flags[33]=require('../assets/img/flags/33.png');
    flags[34]=require('../assets/img/flags/34.png');
    flags[35]=require('../assets/img/flags/35.png');
    flags[36]=require('../assets/img/flags/36.png');
    flags[37]=require('../assets/img/flags/37.png');
    flags[38]=require('../assets/img/flags/38.png');
    flags[39]=require('../assets/img/flags/39.png');

    flags[40]=require('../assets/img/flags/40.png');
    flags[41]=require('../assets/img/flags/41.png');
    flags[42]=require('../assets/img/flags/42.png');
    flags[43]=require('../assets/img/flags/43.png');
    flags[44]=require('../assets/img/flags/44.png');
    flags[45]=require('../assets/img/flags/45.png');
    flags[46]=require('../assets/img/flags/46.png');
    flags[47]=require('../assets/img/flags/47.png');
    flags[48]=require('../assets/img/flags/48.png');
    flags[49]=require('../assets/img/flags/49.png');

    flags[50]=require('../assets/img/flags/50.png');
    flags[51]=require('../assets/img/flags/51.png');
    flags[52]=require('../assets/img/flags/52.png');
    flags[53]=require('../assets/img/flags/53.png');
    flags[54]=require('../assets/img/flags/54.png');
    flags[55]=require('../assets/img/flags/55.png');
    flags[56]=require('../assets/img/flags/56.png');
    flags[57]=require('../assets/img/flags/57.png');
    flags[58]=require('../assets/img/flags/58.png');
    flags[59]=require('../assets/img/flags/59.png');

    flags[60]=require('../assets/img/flags/60.png');
    flags[61]=require('../assets/img/flags/61.png');
    flags[62]=require('../assets/img/flags/62.png');
    flags[63]=require('../assets/img/flags/63.png');
    flags[64]=require('../assets/img/flags/64.png');
    flags[65]=require('../assets/img/flags/65.png');
    flags[66]=require('../assets/img/flags/66.png');
    flags[67]=require('../assets/img/flags/67.png');
    flags[68]=require('../assets/img/flags/68.png');
    flags[69]=require('../assets/img/flags/69.png');

    flags[70]=require('../assets/img/flags/70.png');
    flags[71]=require('../assets/img/flags/71.png');
    flags[72]=require('../assets/img/flags/72.png');
    flags[73]=require('../assets/img/flags/73.png');
    flags[74]=require('../assets/img/flags/74.png');
    flags[75]=require('../assets/img/flags/75.png');
    flags[76]=require('../assets/img/flags/76.png');
    flags[77]=require('../assets/img/flags/77.png');
    flags[78]=require('../assets/img/flags/78.png');
    flags[79]=require('../assets/img/flags/79.png');

    flags[80]=require('../assets/img/flags/80.png');
    flags[81]=require('../assets/img/flags/81.png');
    flags[82]=require('../assets/img/flags/82.png');
    flags[83]=require('../assets/img/flags/83.png');
    flags[84]=require('../assets/img/flags/84.png');
    flags[85]=require('../assets/img/flags/85.png');
    flags[86]=require('../assets/img/flags/86.png');
    flags[87]=require('../assets/img/flags/87.png');
    flags[88]=require('../assets/img/flags/88.png');
    flags[89]=require('../assets/img/flags/89.png');

    flags[90]=require('../assets/img/flags/90.png');
    flags[91]=require('../assets/img/flags/91.png');
    flags[92]=require('../assets/img/flags/92.png');
    flags[93]=require('../assets/img/flags/93.png');
    flags[94]=require('../assets/img/flags/94.png');
    flags[95]=require('../assets/img/flags/95.png');
    flags[96]=require('../assets/img/flags/96.png');
    flags[97]=require('../assets/img/flags/97.png');
    flags[98]=require('../assets/img/flags/98.png');
    flags[99]=require('../assets/img/flags/99.png');


    flags[100]=require('../assets/img/flags/100.png');
    flags[101]=require('../assets/img/flags/101.png');
    flags[102]=require('../assets/img/flags/102.png');
    flags[103]=require('../assets/img/flags/103.png');
    flags[104]=require('../assets/img/flags/104.png');
    flags[105]=require('../assets/img/flags/105.png');
    flags[106]=require('../assets/img/flags/106.png');
    flags[107]=require('../assets/img/flags/107.png');
    flags[108]=require('../assets/img/flags/108.png');
    flags[109]=require('../assets/img/flags/109.png');

    flags[110]=require('../assets/img/flags/110.png');
    flags[111]=require('../assets/img/flags/111.png');
    flags[112]=require('../assets/img/flags/112.png');
    flags[113]=require('../assets/img/flags/113.png');
    flags[114]=require('../assets/img/flags/114.png');
    flags[115]=require('../assets/img/flags/115.png');
    flags[116]=require('../assets/img/flags/116.png');
    flags[117]=require('../assets/img/flags/117.png');
    flags[118]=require('../assets/img/flags/118.png');
    flags[119]=require('../assets/img/flags/119.png');

    flags[120]=require('../assets/img/flags/120.png');
    flags[121]=require('../assets/img/flags/121.png');
    flags[122]=require('../assets/img/flags/122.png');
    flags[123]=require('../assets/img/flags/123.png');
    flags[124]=require('../assets/img/flags/124.png');
    flags[125]=require('../assets/img/flags/125.png');
    flags[126]=require('../assets/img/flags/126.png');
    flags[127]=require('../assets/img/flags/127.png');
    flags[128]=require('../assets/img/flags/128.png');
    flags[129]=require('../assets/img/flags/129.png');

    flags[130]=require('../assets/img/flags/130.png');
    flags[131]=require('../assets/img/flags/131.png');
    flags[132]=require('../assets/img/flags/132.png');
    flags[133]=require('../assets/img/flags/133.png');
    flags[134]=require('../assets/img/flags/134.png');
    flags[135]=require('../assets/img/flags/135.png');
    flags[136]=require('../assets/img/flags/136.png');
    flags[137]=require('../assets/img/flags/137.png');
    
}




