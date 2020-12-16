import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    Button,
    StatusBar
} from 'react-native';
import WebView from 'react-native-webview';

// import {MonoText} from '../components/StyledText';
import {hostConfig} from '../config';

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


class GuestScreen extends Component {

    state = {
        isLoading: true
    };

    handleExit() {
        console.log("lul");
        this
            .props
            .navigation
            .navigate('LoginScreen');
    }
    render() {
        console.log("GuestScreen");

        // if (this.state.isLoading) {
        //     return (
        //         <View style={styles.container}>
        //             <Text>Loading</Text>
        //         </View>
        //     )
        // }
        console.log(hostConfig.address + '/#/rooms');
        return (
            <View style={styles.container}>
            <StatusBar hidden/>
                <WebView
                    source={{
                    uri: hostConfig.address + '/#/rooms'
                }}/>
                <View style={{position:'absolute', bottom:'30%', right:0}}>
                    <Button title="Exit!"
                        style={{}}
                        onPress={() => {
                        this.handleExit()
                    }}/></View>
            </View>
        );
    }
}

// export default function GuestScreen() { //a }

export default GuestScreen;

GuestScreen.navigationOptions = {
    header: null
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    GuestScreenFilename: {
        marginVertical: 7
    }
});
