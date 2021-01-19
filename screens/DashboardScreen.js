import React, {Component} from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    AsyncStorage,
    TextInput
} from 'react-native';
import axios from 'axios';
import AdBar from '../components/AdBar';


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

class DashboardScreen extends Component {
    
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true
        };
    }

    componentDidMount() {

        _retrieveData('x-auth').then((val) => {
            //   console.log(val);
            xauth = val;
            this.setState({isLoading: false});
        }).catch((e) => {
            console.log(e);
        });

    }

    onChangeText(text){
        _storeData('nickname',text);
    }

    handleStart() {
        this
            .props
            .navigation
            .navigate('RoomsScreen');
    }

    handleNative() {
        this
            .props
            .navigation
            .navigate('NativeGameScreen');
    }

    handleShop() {
        this
            .props
            .navigation
            .navigate('NativeShopScreen');
    }
    handleGetCoins() {
        this
            .props
            .navigation
            .navigate('GetCoinsScreen');
    }
    handleCredits() {
        this
            .props
            .navigation
            .navigate('CreditsScreen');
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
                <Text style={styles.title}>FOOTIO</Text>
                <View style={styles.buttonSpace}>
                    <TouchableOpacity
                        onPress={() => {
                        this.handleStart()
                    }}
                        style={styles.button}>
                        <Text style={styles.buttonText}>START ⚽</Text>
                    </TouchableOpacity>
                    
                </View>
                
                <View style={styles.buttonSpace}>
                    <TouchableOpacity
                        onPress={() => {
                        this.handleShop()
                    }}
                        style={styles.button}>
                        <Text style={styles.buttonText}>PICK SKIN</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonSpace}>
                    <TouchableOpacity
                        onPress={() => {
                        this.handleGetCoins()
                    }}
                        style={styles.button}>
                        <Text style={styles.buttonText}>GET COINS</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonSpaceSignOut}>
                    <TouchableOpacity
                        onPress={() => {
                            this
                                .props
                                .navigation
                                .navigate('SignoutScreen');
                        }}
                        style={styles.buttonSignOut}>
                        <Text
                            style={{
                            fontSize: 15
                        }}>Sign out</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.buttonSpaceCredits}>
                    <TouchableOpacity
                        onPress={() => {this.handleCredits()
                        }}
                        style={styles.buttonCredits}>
                        <Text
                            style={{
                            fontSize: 15
                        }}>Credits</Text>
                    </TouchableOpacity>
                </View>
                <AdBar/>
            </View>
        );

    }

}

export default DashboardScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingTop:0,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    },
    buttonSignOut: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    },
    buttonSpaceSignOut: {
        padding: 10,
        position: 'absolute',
        bottom: '10%',
        right: 0
    },
    buttonSpaceCredits:{
        padding: 10,
        position: 'absolute',
        bottom: '30%',
        right: 0
    },
    buttonCredits:{
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        padding: 10
    },
    buttonText: {
        fontSize: 30
    },
    buttonSpace: {
        width: '70%',
        padding: 5
    },
    title: {
        fontSize: 50
    }
});
