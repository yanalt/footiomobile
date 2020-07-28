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
import firebase from 'firebase';

{/* <Text>{firebase.auth().currentUser.email}</Text>
<Text>{firebase.auth().currentUser.displayName}</Text> //a
<Text>{firebase.auth().currentUser.refreshToken}</Text> */
}

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
            // We have data!! console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};

class DashboardScreen extends Component {
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

    onChangeText(text){
        _storeData('nickname',text);
    }

    handleStart() {
        this
            .props
            .navigation
            .navigate('ThreeJSGameScreen');
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
                    <TextInput
                        style={{
                        height: 40,
                        borderColor: 'gray',
                        borderWidth: 1
                    }}
                        onChangeText={text => this.onChangeText(text)}
                        placeholder='Nickname'/>
                </View>
                {/* <View style={styles.buttonSpace}>
                    <TouchableOpacity
                        onPress={() => {
                        this.handleNative()
                    }}
                        style={styles.button}>
                        <Text style={styles.buttonText}>NATIVE</Text>
                    </TouchableOpacity>
                </View> */}
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
                            _storeData('x-auth', '').then(() => {
                                firebase.auth().signOut()
                            }).catch((e)=>{
                                console.log(e);
                            });
                        }}
                        style={styles.buttonSignOut}>
                        <Text
                            style={{
                            fontSize: 15
                        }}>Sign out</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );

    }

}

export default DashboardScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff'
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
