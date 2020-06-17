// import * as WebBrowser from 'expo-web-browser';
import React, {Component} from 'react';
import {StyleSheet, Text, View, AsyncStorage, Button,StatusBar} from 'react-native';
import WebView from 'react-native-webview';
import {AdMobBanner} from 'expo-ads-admob';
// import {MonoText} from '../components/StyledText';
import {hostConfig} from '../config';

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

class GameScreen extends Component {

    state = {
        isLoading: true
    };

    componentDidMount() {

        _retrieveData('x-auth').then((val) => {
            //   console.log(val);
            xauth = val;
            this.setState({isLoading: false});
        }).catch((e) => {
            console.log(e);
        });

    }
    handleExit() {
        console.log("handleExit");
        this
            .props
            .navigation
            .navigate('DashboardScreen');
    }
    render() {

        if (this.state.isLoading) {
            return (
                <View style={styles.container}>
                    <Text>Loading</Text>
                </View>
            )
        }
        console.log(hostConfig.address + '/#/skins?a=' + xauth);
        return (
            <View style={styles.container}>
                <StatusBar hidden/>
                <View>
                    <AdMobBanner
                        adSize="smartBannerPortrait"
                        adUnitID="ca-app-pub-3940256099942544/2934735716"/></View>
                <WebView
                    source={{
                    uri: hostConfig.address + '/#/skins?a=' + xauth,
                    headers: {
                        'x-auth': xauth
                    }
                }}/>
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

// export default function GameScreen() { //a }

export default GameScreen;

GameScreen.navigationOptions = {
    header: null
};

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    GameScreenFilename: {
        marginVertical: 7
    }
});
