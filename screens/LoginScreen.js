import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Button,
    TouchableOpacity,
    Text,
    View,
    AsyncStorage
} from 'react-native';
import * as Expo from 'expo';
import firebase from 'firebase';
import axios from 'axios';
import {hostConfig} from '../config';
import * as Google from 'expo-google-app-auth';
import AdBar from '../components/AdBar';

console.disableYellowBox = true;
console.warn = function() {};

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
            // We have data!!
            // console.log(value);
            return value;
        }
    } catch (e) {
        console.log(e);
    }
};

omegalul = function () {
    console.log("OMEGALUL");
}

handleNewUser = function (email, token) {
    console.log('handleNewUser');
    axios({
        method: 'post',
        url: hostConfig.address + '/users/androidsignup', //???????????????????????????????????
        data: {
            email,
            refreshToken: token
        }
    }).then((res) => {
        console.log(res.headers['x-auth']);
        _storeData('x-auth', res.headers['x-auth']).then(() => {
            this
                .props
                .navigation
                .navigate('DashboardScreen');
        });
    }).catch((e) => {
        console.log(e);
        // for(var propName in e) {     let propValue = e[propName];
        // console.log(propName,propValue); }
    });
}

handleReturningUser = function (email, token) {
    console.log('handleReturningUser');
    console.log(hostConfig.address);
    axios({
        method: 'post',
        url: hostConfig.address + '/users/androidlogin',
        data: {
            email,
            refreshToken: token
        }
    }).then((res) => {
        console.log(res.headers['x-auth']);
        _storeData('x-auth', res.headers['x-auth']).then(() => {
            this
                .props
                .navigation
                .navigate('DashboardScreen');
        });
    }).catch((e) => {
        console.log(e);
        // for(var propName in e) {     let propValue = e[propName];
        // console.log(propName,propValue); }
    });
}

class LoginScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded : false
        }
    }

    componentDidMount(){
        this.setState({isLoaded:true});
    }

    isUserEqual = (googleUser, firebaseUser) => {
        console.log("isUserEqual");
        if (firebaseUser) {
            var providerData = firebaseUser.providerData;
            for (var i = 0; i < providerData.length; i++) {
                if (providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID && providerData[i].uid === googleUser.getBasicProfile().getId()) {
                    // We don't need to reauth the Firebase connection.
                    return true;
                }
            }
        }
        return false;
    }

    onSignIn = (googleUser) => {
        console.log("onSignIn");
        // console.log('Google Auth Response', googleUser); We need to register an
        // Observer on Firebase Auth to make sure auth is initialized.
        var unsubscribe = firebase
            .auth()
            .onAuthStateChanged(function (firebaseUser) {
                unsubscribe();
                // Check if we are already signed-in Firebase with the correct user.
                if (!this.isUserEqual(googleUser, firebaseUser)) {
                    // Build Firebase credential with the Google ID token.
                    var credential = firebase
                        .auth
                        .GoogleAuthProvider
                        .credential(googleUser.idToken, googleUser.accessToken);
                    // Sign in with credential from the Google user.
                    firebase
                        .auth()
                        .signInWithCredential(credential)
                        .then(function (result) {
                            console.log('user signed in!');
                            if (result.additionalUserInfo.isNewUser) {
                                console.log("New user");
                                handleNewUser(googleUser.user.email, googleUser.idToken);
                                omegalul();
                            } else {
                                console.log("Returning user");
                                handleReturningUser(googleUser.user.email, googleUser.idToken);
                            }
                        })
                        .catch(function (e) {
                            console.log(e);
                        });
                } else {
                    console.log('User already signed in with Firebase.');
                }
            }.bind(this));
    }

    signInWithGoogleAsync = async() => {
        try {
            this.setState({isLoaded:false});
            const result = await Google
                .logInAsync({
                    behavior: 'web', 
                    androidClientId: '759889128579-jhgdv8nbg9ri1ocn19ja0d07dhlfep9p.apps.googleusercontent.com',
                    androidStandaloneAppClientId: '759889128579-uaqe04e8e7d6bhtfeca56a6n26u0ctor.apps.googleusercontent.com',
                    // iosClientId:
                    // '759889128579-ir3o6i9ei8bi95vrq0g7q2ct29klf9qm.apps.googleusercontent.com',
                    scopes: ['profile', 'email']
                });

            if (result.type === 'success') {
                this.onSignIn(result);
                return result.accessToken;
            } else {
                this.setState({isLoaded:true});
                return {cancelled: true};
            }
        } catch (e) {
            this.setState({isLoaded:true});
            console.log(e);
            return {error: true};
        }
    };

    handleGuest = async() => {
        console.log("handleGuest");
        try {
            this
                .props
                .navigation
                .navigate('ThreeJSGameScreen');
                console.log("lul");
        } catch (e) {
            console.log(e);
            alert(e);
            return {error: true};
        }
    };

    render() {
        console.log("render");
        if(this.state.isLoaded){
            return (
                <View style={styles.container}>
                    {/* <Button
                        title="Sign In With Google"
                        onPress={() => this.signInWithGoogleAsync()}/>
                    <Button title="Play as a guest! ⚽" onPress={() => this.handleGuest()}/> */}


                    <Text style={styles.title}>FOOTIO</Text>
                    
                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => this.signInWithGoogleAsync()}
                            style={styles.button}>
                            <Text style={styles.buttonText}>SIGN IN WITH GOOGLE</Text>
                        </TouchableOpacity>                        
                    </View>

                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => this.handleGuest()}
                            style={styles.button}>
                            <Text style={styles.buttonText}>PLAY AS A GUEST! ⚽</Text>
                        </TouchableOpacity>                        
                    </View>
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
//
export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: 100,
        marginBottom: 20,
        flex: 1,
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
