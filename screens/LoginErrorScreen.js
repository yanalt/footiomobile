import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Button,
    TouchableOpacity,
    Text,
    View,
    AsyncStorage,
    TextInput,
    Platform,LogBox
} from 'react-native';
import axios from 'axios';
import {hostConfig} from '../config';
import AdBar from '../components/AdBar';

LogBox.ignoreAllLogs(true);
console.warn = function() {};

async function _storeData (str, val) {
    try {
        await AsyncStorage.setItem(str, val);
    } catch (e) {
        console.log(e);
    }
};

async function _retrieveData (str) {
    try {
        const value = await AsyncStorage.getItem(str);
        if (value !== null) {
            // We have data!!
            // console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};




let timer = -2;
let timerInterval = null;


class SignoutScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded : false,
            email: '',
            password: '',
            revealedID: 'Click to show your ID',
            revealedCode: 'Click to show your code',
            isIDrevealed: false,
            isCoderevealed: false,
            signOutTimer: '👈',
        }
    }

       
    async componentDidMount(){
        let email = await _retrieveData('email');
        let password = await _retrieveData('password');
        this.setState({
            isLoaded:true,
            email,
            password      
        });
    }



    handleExit() {
        console.log("handleExit");
        timer = -2;

        _retrieveData('x-auth').then((val) => {
            console.log(val);
            if(val){
                this
                    .props
                    .navigation
                    .navigate('DashboardScreen');
            }else{
                this
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
        console.log("render");
        if(this.state.isLoaded){
            return (
                <View style={styles.container}>
                    {/* <Button
                        title="Sign In With Google"
                        onPress={() => this.signInWithGoogleAsync()}/>
                    <Button title="Play as a guest! ⚽" onPress={() => this.handleGuest()}/> */}


                    <Text style={styles.title}>Connection failure</Text>
                    <Text style={styles.warning}>Please restart the app, or contact us by email at mundiogame@gmail.com</Text>
                    <Text style={styles.warning}>Your skin code is: {this.state.email} - Please write it in your email message.</Text>
                    
                    <AdBar/>
                </View>
            );
        }else{
            return (
                <View style={styles.container}>
                    <Text>Loading..</Text>
                </View>
            );
        }
    }
}

export default SignoutScreen;

let displayAndroid = 'flex',displayIos = 'flex';
if(Platform.OS=='android'){
    displayIos = 'flex';
}
if(Platform.OS=='ios'){
    displayAndroid='none';
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 70,
        marginBottom: 0,
        flex: 1,
        backgroundColor: '#fff',
        // justifyContent: 'center'
    },
    
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        display:displayAndroid,
        padding: 10,
        
    },
    buttonApple: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        display:displayIos,
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
        flexDirection: 'row',
        alignContent: 'center',
        padding: 5
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
    title: {
        fontSize: 50
    },
    warning: {
        fontSize: 15,
        padding: 10,
        color: "#DD0000",
        fontStyle: "italic",
        fontWeight: "bold"
    }
});
