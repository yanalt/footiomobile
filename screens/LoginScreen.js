import React, {Component} from 'react';
import {
    Image,
    StyleSheet,
    Button,
    TouchableOpacity,
    Text,
    View,
    AsyncStorage,
    Platform,LogBox
} from 'react-native';
import * as Expo from 'expo';
import axios from 'axios';
import {hostConfig} from '../config';
import AdBar from '../components/AdBar';
import ShortUniqueId from 'short-unique-id';

let uidDictionary = ['a','b','c','d','e','f','g','h','i','j','k','m','n','p','q','r','s','t','u','v','w','x','y','z','2','3','4','5','6','7','8','9'];
const uid = new ShortUniqueId({ dictionary: uidDictionary , length: 6 });
const upass = new ShortUniqueId({ dictionary: uidDictionary , length: 8 });

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










class LoginScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoaded : false
        }
    }

       
    componentDidMount(){
        _retrieveData('x-auth').then((val)=>{
            if(val!=null&&val!=undefined&&val.length>10){
                this.props.navigation.navigate('DashboardScreen');
            }else{
                this.setState({isLoaded:true});
            }
        }).catch((e)=>{
            console.log(e);
            this.setState({isLoaded:true});
        });
    }

    
    async handleNewUser() {
        try{
            console.log('handleNewUser');
            let email = uid();
            let password = upass();

            console.log(email+' '+password);
            
            let res = await axios({
                method: 'post',
                url: hostConfig.address + '/users/', //network error solution: add http:// before the address in config......
                data: {
                    email: email,
                    password: password
                }
            });

            if(res){
                console.log(res.headers['x-auth']);
                await _storeData('x-auth', res.headers['x-auth'])
                await _storeData('email', email);
                await _storeData('password', password);
                this
                    .props
                    .navigation
                    .navigate('DashboardScreen');
            }
        }catch(e){
            console.log(e);
        }
    }
    
    
    
    handleReturningUser1(email, password) { //move to new screen
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
    
    handleReturningUser() {
        this
            .props
            .navigation
            .navigate('ReturningScreen');
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


                    <Text style={styles.title}>FOOTIO</Text>
                    
                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => this.handleNewUser()}
                            style={styles.button}>
                            <Text style={styles.buttonText}>I AM NEW!</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.buttonSpace}>
                        <TouchableOpacity
                            onPress={() => this.handleReturningUser()}
                            style={styles.button}>
                            <Text style={styles.buttonText}>I HAVE OLD CODE!</Text>
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
