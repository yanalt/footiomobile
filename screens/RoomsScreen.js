import React, {Component} from 'react';
import {StyleSheet, Text, View, AsyncStorage, Button,TouchableOpacity, FlatList} from 'react-native';
import {hostConfig} from '../config';
import axios from 'axios';
import AdBar from '../components/AdBar';

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
            // We have data!
            // console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};

let xauth = '';
let RoomsScreenHolder = '';

const Item = ({ location,playerAmount,difficulty,ip,port }) => (
    <View style={styles.buttonSpace}>
        <TouchableOpacity
            onPress={() => {
                RoomsScreenHolder.handleRoomChoice(ip,port)
        }}
            style={styles.button}>
            <Text style={styles.buttonText}>{location} {port} {difficulty} {playerAmount}/10</Text>
        </TouchableOpacity>
    </View>
  );

class RoomsScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            serverList: [],
            isLoading: true
        };
        RoomsScreenHolder = this;
    }

    componentDidMount() {
        this.loadSkinConfirm();
        this.refreshServers();
        setInterval(this.refreshServers,10*1000);
    }

    async loadSkinConfirm(){
        _retrieveData('x-auth').then((val) => {
            //   console.log(val);
            xauth = val;
            axios({
                method: 'post',
                headers: {
                  'x-auth': xauth
                },
                url: hostConfig.address +'/users/skintoken'
              }).then(response=>{
                _storeData('skinToken',response.headers.skin);
              });
        }).catch((e) => {
            console.log(e);
        });
    }

    handleRoomChoice(ip,port){
        console.log(ip+':'+port);
        this.props.navigation.navigate('ThreeJSGameScreen',{ip,port});
    }

    handleQuickRoom(str){
        let arr = this.state.serverList;
        for (let i = 0; i < arr.length; i++) {
            if(arr[i].difficulty==str&&arr[i].playerAmount<=9){
                this.handleRoomChoice(arr[i].ip,arr[i].port);
                return;
            }
        }
        
    }

    renderItem = ({ item }) => {
        
        return (
        <Item 
            location={item.location} 
            difficulty={item.difficulty}
            ip={item.ip}
            port={item.port}
            playerAmount={item.playerAmount}
             />
    )};

    refreshServers(){
        // RoomsScreenHolder.setState({isLoading:true});
        axios({
            method: 'get',
            url: hostConfig.address + '/roomStats'
        }).then(response => {
            if(Array.isArray(response.data.rooms)){
                response.data.rooms.sort((a,b)=>{ return a.playerAmount<b.playerAmount});
                RoomsScreenHolder.setState({serverList: response.data.rooms, isLoading:false});
            }
        }).catch((e) => {
            console.log(e);
        });
    }

    handleExit() {
        console.log("handleExit");

        _retrieveData('x-auth').then((val) => {
            console.log(val);
            if(val){
                RoomsScreenHolder
                    .props
                    .navigation
                    .navigate('DashboardScreen');
            }else{
                RoomsScreenHolder
                    .props
                    .navigation
                    .navigate('LoginScreen');
            }
        }).catch((e) => {
            RoomsScreenHolder
                .props
                .navigation
                .navigate('LoginScreen');
            console.log(e);
        });
    }
    render() {

        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <Text>Loading</Text>
                </View>
            )
        }
        return (
            <View style={styles.container}>
                <View style={styles.subContainer}>
                    <Text style={styles.title}>QUICK GAME</Text>

                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => {
                                RoomsScreenHolder.handleQuickRoom('easy')
                        }}
                            style={styles.button}>
                            <Text style={styles.bigButtonText}>EASY 👶</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => {
                                RoomsScreenHolder.handleQuickRoom('normal')
                        }}
                            style={styles.button}>
                            <Text style={styles.bigButtonText}>NORMAL 🙂</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => {
                                RoomsScreenHolder.handleQuickRoom('hard')
                        }}
                            style={styles.button}>
                            <Text style={styles.bigButtonText}>HARD 💀</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
                <View style={styles.subContainer}>
                    <Text style={styles.title}>PICK ROOM</Text>
                    <FlatList
                            data={this.state.serverList}
                            renderItem={this.renderItem}
                            keyExtractor={item => item.id} 
                            extraData={this.state}
                            />

                </View>
                    <View
                        style={{
                        position: 'absolute',
                        top: '30%',
                        right: 0
                    }}>
                        <Button
                            title="Exit!"
                            style={{}}
                            onPress={() => {
                            this.handleExit()
                        }}/></View>
                <AdBar/>
            </View>
        );
    }
}

// export default function RoomsScreen() { //a }

export default RoomsScreen;

RoomsScreen.navigationOptions = {
    header: null
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop:30,
        paddingLeft:30,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        justifyContent: 'center'
    },
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 2
    },
    buttonText: {
        fontSize: 15
    },
    bigButtonText: {
        fontSize: 18,
        paddingVertical: 10
    },
    buttonSpace: {
        width: '100%',
        padding: 3
    },
    subContainer:{
        width: '40%',
        height: '80%',
        alignItems: "center",
    },
    title: {
        fontSize: 20
    }

});
