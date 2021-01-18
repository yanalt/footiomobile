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




let handleNewUser = async function () {
    console.log('handleNewUser');
    let email = uid();
    let password = upass();
    axios({
        method: 'post',
        url: hostConfig.address + '/users/', 
        data: {
            email,
            password
        }
    }).then((res) => {
        console.log(res.headers['x-auth']);
        _storeData('x-auth', res.headers['x-auth']).then(() => {
            await _storeData('email', email);
            await _storeData('password', password);
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



let handleReturningUser = function (email, password) { //move to new screen
    console.log('handleLoggedInUser');
    console.log(hostConfig.address);
    axios({
        method: 'post',
        url: hostConfig.address + '/users/login',
        data: {
            email,
            password
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
            isLoaded : false,
            email: '',
            password: ''
        }
    }

       
    componentDidMount(){
        this.setState({isLoaded:true});
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
                            style={styles.button}>
                            <TextInput onChangeText={text => onChangeText(text,null)} value='Your old ID'/>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            style={styles.button}>
                            <TextInput onChangeText={text => onChangeText(null,text)} value='Your old code'/>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => this.handleReturningUser()}
                            style={styles.button}>
                            <Text style={styles.buttonText}>OK</Text>
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

export default LoginScreen;

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
        justifyContent: 'center'
    },
    
    button: {
        alignItems: "center",
        backgroundColor: "#DDDDDD",
        display:displayAndroid,
        padding: 10
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
        width: '70%',
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
    }
});
