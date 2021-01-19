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
    Platform
} from 'react-native';
import axios from 'axios';
import {hostConfig} from '../config';
import AdBar from '../components/AdBar';

console.disableYellowBox = true;
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

    revealID(){
        if(timer<0&&this.state.email!=null&&this.state.email!=''){
            this.setState({
                revealedID: 'Your ID is: ' + this.state.email,
                isIDrevealed: true,
            });
            setTimeout(() => {
                this.startTimer();
            }, 300);
        }
    }

    revealCode(){
        if(timer<0&&this.state.password!=null&&this.state.password!=''){
            this.setState({
                revealedCode: 'Your code is: ' + this.state.password,
                isCoderevealed: true,
            });
            setTimeout(() => {
                this.startTimer();
            }, 300);
        }
    }

    async handleSignout(){
        await _storeData('x-auth','');
        await _storeData('email','');
        await _storeData('password','');

        this
            .props
            .navigation
            .navigate('LoginScreen');
    }

    startTimer(){
        console.log(timer+'<0&&'+this.state.isCoderevealed+'&&'+this.state.isIDrevealed)
        if(timer<0&&this.state.isCoderevealed&&this.state.isIDrevealed){
            timer = 10;
            timerInterval = setInterval(() => {
                timer--;
                if(timer>0)
                    this.setState({signOutTimer: timer});
                else{
                    this.setState({signOutTimer: 'Sign out.'});
                    clearInterval(timerInterval);
                }
            }, 1000);
        }
    }

    onChangeText(email, password){
        if(email!=null){
            this.setState({email});
        }
        if(password!=null){
            this.setState({password});
        }
    }

    // TODO: make the submit button work

    handleExit() {
        console.log("handleExit");

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


                    <Text style={styles.title}>Sign out</Text>
                    <Text style={styles.warning}>Warning: if you lose your ID and code, you will lose access to your collected skins forever. There is no recovery option at all. You have to manually write down the ID and code on a piece of paper and remember it for a future login.</Text>
                    
                    <View style={styles.buttonSpace}>
                        <View style={styles.buttonSpace}>
                            <TouchableOpacity
                                style={styles.button}>
                                <Text onTouchStart={() => {this.revealID()}}> {this.state.revealedID}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.buttonSpace}>
                            <TouchableOpacity
                                style={styles.button}>
                                <Text onTouchStart={() => {this.revealCode()}}> {this.state.revealedCode}</Text>
                            </TouchableOpacity>
                        </View>


                        <View style={styles.buttonSpace}>
                            <TouchableOpacity
                                onPress={() => this.handleSignout()}
                                style={styles.button}><Text>{this.state.signOutTimer}</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={styles.buttonSpace}>
                    </View>


                    <AdBar/>
                    <View
                    style={{
                    position: 'absolute',
                    bottom: '30%',
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
