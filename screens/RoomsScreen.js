import React, {Component} from 'react';
import {StyleSheet, Text, View, AsyncStorage, Button,StatusBar, FlatList} from 'react-native';
import {hostConfig} from '../config';
import axios from 'axios';

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
    <View>
      <Text>{location} {port} {difficulty} {playerAmount}/10 </Text>
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
        this.refreshServers();
        setInterval(this.refreshServers,10*1000);
    }

    renderItem = ({ item }) => {
        
        console.log(item);
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

                <FlatList
                        data={this.state.serverList}
                        renderItem={this.renderItem}
                        keyExtractor={item => item.id} 
                        extraData={this.state}
                        />

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
        flex: 1
    }

});
