import React, {Component} from 'react';
import {
    Image,
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    View,
    AsyncStorage,
    Platform
} from 'react-native';
import axios from 'axios';
import {hostConfig} from '../config';

async function _storeData(str, val) {
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

class LoadingScreen extends Component {

    componentDidMount() {
        console.log("LoadingScreen.js componentDidMount");
        if(Platform.OS=='android'||Platform.OS=='ios'){
            console.log(Platform.OS);
            this.checkIfLoggedIn();
        }else{
            this
                .props
                .navigation
                .navigate('GuestScreen');
        }
    }
    // handleLoggedIn(user) { //used for google sign-in
    //     let deez = this;
    //     console.log("LoadingScreen.js handleLoggedIn()");
    //     console.log(user.email); console.log(user.idToken);
    //     user
    //         .getIdToken(/* forceRefresh */
    //         true)
    //         .then(function (idToken) {

    //             axios({
    //                 method: 'post',
    //                 url: hostConfig.address + '/users/androidlogin',
    //                 data: {
    //                     email: user.email,
    //                     refreshToken: idToken
    //                 }
    //             })
    //             .then((res) => {
    //                 console.log(res.headers['x-auth']);
    //                 _storeData('x-auth', res.headers['x-auth']).then(() => {
    //                     deez
    //                         .props
    //                         .navigation
    //                         .navigate('DashboardScreen');
    //                 });
    //             }).catch((e)=>{
    //                 console.log(e);
    //             })
    //         })
    //         .catch((e) => {
    //             console.log("ROFL");
    //             console.log(e);
    //             console.log(e.stack);
    //             // for(var propName in e) {     let propValue = e[propName] //a
    //             // console.log(propName,propValue); }
    //         });
    // }
    async checkIfLoggedIn() {
        console.log("LoadingScreen.js checkIfLoggedIn");
        
        let xAuthVal = await _retrieveData('x-auth');
        if(xAuthVal==null||xAuthVal==undefined||xAuthVal.length<10){
            this
                .props
                .navigation
                .navigate('LoginScreen');
        }else{
            console.log('an x-auth exists locally');
            let response = null;
            try{
                response = await axios({
                    method: 'post',
                    headers: {
                        'x-auth': xAuthVal
                    },
                    url: hostConfig.address + '/users/skintoken'
                });
            }catch(e){
                console.log('lmao ');
                console.log(e);
            }
            if (response){
                console.log('the x-auth is good, redirect to dashboard');
                this.setState({isLoading: false});
                this
                    .props
                    .navigation
                    .navigate('DashboardScreen');
            }else{
                console.log('that x-auth is no longer recognized');
                let email = await _retrieveData('email');
                let password = await _retrieveData('password');
                
                let loginRes = null;
                try{
                    loginRes= await axios({
                        method: 'post',
                        url: hostConfig.address + '/users/login', //network error solution: add http:// before the address in config......
                        data: {
                            email: email,
                            password: password
                        }
                    });
                }catch(e){
                    console.log(e);
                }
                if(loginRes){
                    console.log('successfully received new x-auth');
                    await _storeData('x-auth', loginRes.headers['x-auth']);
                    this
                        .props
                        .navigation
                        .navigate('DashboardScreen');
                }else{
                    console.log('the absolute state of this lad');
                    this
                        .props
                        .navigation
                        .navigate('LoginErrorScreen');
                }

            }

        }

    }

    render() {
        console.log("LoadingScreen.js render");
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large"/>
            </View>
        )
    }
}

export default LoadingScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    developmentModeText: {
        marginBottom: 20,
        color: 'rgba(0,0,0,0.4)',
        fontSize: 14,
        lineHeight: 19,
        textAlign: 'center'
    },
    contentContainer: {
        paddingTop: 30
    },
    welcomeContainer: {
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20
    },
    welcomeImage: {
        width: 100,
        height: 80,
        resizeMode: 'contain',
        marginTop: 3,
        marginLeft: -10
    },
    getStartedContainer: {
        alignItems: 'center',
        marginHorizontal: 50
    },
    homeScreenFilename: {
        marginVertical: 7
    },
    codeHighlightText: {
        color: 'rgba(96,100,109, 0.8)'
    },
    codeHighlightContainer: {
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: 3,
        paddingHorizontal: 4
    },
    getStartedText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        lineHeight: 24,
        textAlign: 'center'
    },
    tabBarInfoText: {
        fontSize: 17,
        color: 'rgba(96,100,109, 1)',
        textAlign: 'center'
    },
    navigationFilename: {
        marginTop: 5
    },
    helpContainer: {
        marginTop: 15,
        alignItems: 'center'
    },
    helpLink: {
        paddingVertical: 15
    },
    helpLinkText: {
        fontSize: 14,
        color: '#2e78b7'
    }
});
