import React, {Component} from 'react';
import axios from 'axios';
import {hostConfig} from '../config';
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


let xauth = '';

_storeData = async (str, val) => {
    try {
        await AsyncStorage.setItem(str, val);
    } catch (e) {
        console.log(e);
    }
};

_retrieveData = async (str) => {
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


class NativeShopScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showCompleted: false,
            searchText: '',
            OwnedsearchText: '',
            skins: [],
            Ownedskins: [],
            creditBalance: 0,
            currentSkin: null,
            skinToken: ''
        };

    }

    _isMounted = true;

    componentDidUpdate() {
        SkinAPI.setSkins(this.state.skins);
    }

    componentWillUnmount() {
        this._isMounted = false;
        this.setState = (state,callback)=>{
            return;
        };
      }

    async componentDidMount() {
        this._isMounted = true;
        xauth = await _retrieveData('x-auth');
        axios({
            method: 'post',
            headers: {
                'x-auth': xauth
            },
            url: hostConfig.address + '/users/skintoken'
        }).then(response => {
            if (this._isMounted)
                this.setState({skinToken: response.headers.skin});
        }).catch((e) => {
            console.log('failed response from skins');
            console.log('err' + e);
        });
        SkinAPI.getCreditBalance().then(creditBalance => {
            if (this._isMounted)
                this.setState({creditBalance});
            if (creditBalance == null || creditBalance == undefined) { // window.location.hash = '#/';
            }
        }).catch((e) => {
            console.log('err' + e);
        });
        SkinAPI.updateLastTime().catch((e) => {
            console.log('err' + e)
        });
        SkinAPI.getSkins().then(skins => {
            if (this._isMounted)
                this.setState({skins});
        }).catch((e) => {
            console.log('err' + e);
        });
        SkinAPI.getOwnedSkins().then(Ownedskins => {
            if (this._isMounted)                
                this.setState({Ownedskins});
        }).catch((e) => {
            console.log('err' + e);
        });
        SkinAPI.getCurrentSkin().then(currentSkin => {
            if (this._isMounted)
                this.setState({currentSkin});
        }).catch((e) => {
            console.log('err' + e);
        });
    }
    handleConfirm(skinId, price) {
        if (price <= this.state.creditBalance) {
            axios({
                method: 'post',
                headers: {
                    'x-auth': xauth
                },
                url: hostConfig.address + '/users/purchase',
                data: {
                    skinId
                }
            });

            SkinAPI.getSkins().then(skins => {
                if (this._isMounted){
                    this.setState({skins});
                    SkinAPI.setSkins(skins);}
            }).catch((e) => {
                console.log('err' + e);
            });
            SkinAPI.getCreditBalance().then(creditBalance => {
                if (this._isMounted)
                    this.setState({creditBalance});
            }).catch((e) => {
                console.log('err' + e);
            });
            SkinAPI.getCurrentSkin().then(currentSkin => {
                if (this._isMounted)
                    this.setState({currentSkin});
            }).catch((e) => {
                console.log('err' + e);
            });
        } else {
            document.getElementById('creditBalanceTitle').style.backgroundColor = "red";
        }
    }
    handleSearch(showCompleted, searchText) {
        if (this._isMounted)
            this.setState({showCompleted: showCompleted, searchText: searchText.toLowerCase()});
    }
    OwnedhandleConfirm(skinId) {
        axios({
            method: 'post',
            headers: {
                'x-auth': xauth
            },
            url: hostConfig.address + '/users/skinpick',
            data: {
                skinId
            }
        });
        SkinAPI.getCurrentSkin().then(currentSkin => {
            if (this._isMounted)
                this.setState({currentSkin});
        }).then(() => {
            window.location.reload();
        }).catch((e) => {
            console.log('err' + e);
        });
    }
    OwnedhandleSearch(showCompleted, searchText) {
        if (this._isMounted)
            this.setState({showCompleted: showCompleted, searchText: searchText.toLowerCase()});
    }
    render() {
        let {
            skins,
            showCompleted,
            searchText,
            Ownedskins,
            OwnedsearchText,
            creditBalance,
            currentSkin
        } = this.state;
        let ActualOwnedSkins = skins.map((skin) => {
            for (let i = 0; i < Ownedskins.length; i++) {
                if (Ownedskins[i].skinId == skin._id) {
                    skin.Owned = true;
                    return skin;
                }
            }
        });
        let ActualSkins = skins.map((skin) => {
            for (let i = 0; i < Ownedskins.length; i++) {
                if (Ownedskins[i].skinId == skin._id) 
                    return null;
                
            }
            return skin;
        });

        let filteredSkins = SkinAPI.filterSkins(ActualSkins, showCompleted, searchText);
        let OwnedfilteredSkins = SkinAPI.filterSkins(ActualOwnedSkins, showCompleted, searchText); // make this

        return (
            <View>


                <View style={
                    {textAlign: 'center'}
                }>

                    <SkinSearch onSearch={
                        this.handleSearch
                    }/>
                    <View style={
                            {
                                width: '100%',
                                textAlign: 'center'
                            }
                        }
                        id="creditBalanceTitle">
                        <Text>Coins: {creditBalance}</Text>
                    </View>
                    <View style={
                        {
                            width: '40%'
                        }
                    }>
                        <View style={
                            {
                                width: '100%'
                            }
                        }>
                            <Text 
                                className="page-title">Unlocked Skins</Text>
                        </View>
                        <View 
                            className="row"
                            id="owned">
                            <View className="column small-centered">
                                <View className="container">
                                    <SkinList skins={OwnedfilteredSkins}
                                        current={currentSkin}
                                        onConfirm={
                                            this.OwnedhandleConfirm
                                        }/>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={
                        {
                            width: '40%'
                        }
                    }>
                        <Text className="page-title">Locked Skins</Text>

                        <View
                            className="row">
                            <View className="column small-centered small-11 medium-6 large-5">
                                <View className="container">
                                    <SkinList skins={filteredSkins}
                                        onConfirm={
                                            this.handleConfirm
                                        }/>
                                </View>
                            </View>
                        </View>

                    </View>

                </View>


            </View>
        );
    }
}


export default NativeShopScreen;

NativeShopScreen.navigationOptions = {
    header: null
};


let SkinAPI = {
    setSkins: async function (skins) {
        if (Array.isArray(skins)) {
            await _storeData('skins', JSON.stringify(skins));
            return skins;
        }
    },
    setOwnedSkins: async function (skins) {
        if (Array.isArray(skins)) {
            await _storeData('Ownedskins', JSON.stringify(skins));
            return skins;
        }
    },
    getCreditBalance: function () {
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/creditbalance',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            return response.data;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    updateLastTime: function () {
        return axios({
            method: 'post',
            url: hostConfig.address + '/users/lasttime',
            headers: {
                'x-auth': xauth
            }
        }).catch((e) => {
            console.log('failed response from lasttime');
            console.log(e);
        });
    },
    getCurrentSkin: function () {
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/currentskin',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            return response.data;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    getSkins: function () {
        let skins = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/skins',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            skins = Array.concat(true, [], response.data.skins);
            console.log('successful response from skins');
        }).then(() => {
            return skins;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    getRooms: function () {
        let rooms = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/rooms'
        }).then(function (response) {
            rooms = response.data;
            console.log('successful response from skins');
        }).then(() => {
            return rooms;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    getOwnedSkins: function () {
        let skins = [];
        return axios({
            method: 'get',
            url: hostConfig.address + '/users/me/skins',
            headers: {
                'x-auth': xauth
            }
        }).then(function (response) {
            skins = Array.concat(true, [], response.data);
            console.log('successful response from skins');
        }).then(() => {
            return skins;
        }).catch((e) => {
            console.log('failed response from skins');
            console.log(e);
        });
    },
    filterSkins: function (skins, showCompleted, searchText) {
        let filteredSkins = skins;


        // Filter by searchText
        filteredSkins = filteredSkins.filter((skin) => {
            if (skin != undefined) {
                let name = skin.name.toLowerCase();
                return searchText.length === 0 || name.indexOf(searchText) > -1;
            }
        });


        return filteredSkins;
    }
};

class SkinSearch extends Component {
    handleSearch() {
        let showCompleted = true;
        let searchText = this.refs.searchText.value;

        this.props.onSearch(showCompleted, searchText);
    }
    render() {
        let inputStyle = {},
            buttonTags = "button expanded";
        if (window.orientation != 'undefined' && window.orientation != undefined) {
            inputStyle = {
                fontSize: '200%',
                height: '10%',
                width: '70%',
                textAlign: 'center'
            };
            buttonTags = "button large expanded";
        }
        return (
            <View className="container__header">
                <View>
                    <TextInput type="search"
                        style={inputStyle}
                        ref="searchText"
                        placeholder="Click here to search skins"
                        onChange={
                            this.handleSearch
                        }/>
                </View>
            </View>
        )
    }
};

class SkinList extends Component {
    render() {
        let {skins, current} = this.props;
        let renderSkins = () => {

            if (skins) {
                if (skins.length === 0) {
                    return (
                        <View className="container__message">
                            <Text>Nothing To Show</Text>
                        </View>
                    );
                }

                return skins.map((skin) => {
                    return (
                        <Skin current={current}
                            key={
                                skin._id
                            }
                            {...skin}
                            onConfirm={
                                this.props.onConfirm
                            }/>
                    );
                });
            }else{
                return (<View>
                    <Text>None found.</Text>
                </View>)
            }
        };

        return (
            <View> {
                renderSkins()
            } </View>
        )
    }
}


class Skin extends Component {
    render() {
        let inputStyle = {},
            buttonTags = {
                fontSize: 27
            },
            hiddenButtonTags = {
                fontSize: 27,
                display: 'none'
            };
        let skinContainer = {
            border: '2px solid blue',
            borderRadius: '20px',
            padding: 10,
            fontSize: 27
        }
        // if(window.orientation!='undefined'&&window.orientation!=undefined){
        //     inputStyle={fontSize: '500%', height:100};
        //     buttonTags="button large expanded";
        // }
        let {
            _id,
            name,
            completed,
            icon,
            sprite,
            price,
            current
        } = this.props;
        let idConfirm = _id + "Confirm";
        let idCancel = _id + "Cancel";
        let idUnlock = _id + "Unlock";
        let srcImage = "/img/" + sprite + ".png";
        let srcFlag = "/img/flags/" + sprite + ".png";
        let here = "";
        if (_id == current) {
            here = " - SELECTED";
        }

        if (this.props.Owned != undefined && this.props.Owned == true) {
            return (
                <View style={skinContainer}>
                    <View>
                        <Text>{name}
                            {here}</Text>
                    </View>
                    <View>

                        <Image src={srcImage}/>
                        <Image src={srcFlag}/>
                        <TouchableOpacity style={buttonTags}
                            id={idUnlock}
                            onClick={
                                () => { // this.props.onToggle(_id);
                                    document.getElementById(idConfirm).style.display = "inline";
                                    document.getElementById(idCancel).style.display = "inline";
                                    document.getElementById(idUnlock).style.display = "none";
                                }
                        }>
                            <Text>Choose {name}!</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={hiddenButtonTags}
                            id={idCancel}
                            onClick={
                                () => {
                                    document.getElementById(idConfirm).style.display = "none";
                                    document.getElementById(idCancel).style.display = "none";
                                    document.getElementById(idUnlock).style.display = "inline";
                                }
                        }>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={hiddenButtonTags}
                            id={idConfirm}
                            onClick={
                                () => {
                                    this.props.onConfirm(_id);
                                }
                        }><Text>Confirm</Text></TouchableOpacity>
                    </View>
                </View>
            )
        }
        return (
            <View style={skinContainer}>
                <View>
                    <Image src={srcImage}/>
                    <Image src={srcFlag}/>

                </View>
                <View>
                    <Text>{name}
                        - {price}
                        coins
                    </Text>
                    <TouchableOpacity style={buttonTags}
                        id={idUnlock}
                        onClick={
                            () => { // this.props.onToggle(_id);
                                document.getElementById(idConfirm).style.display = "inline";
                                document.getElementById(idCancel).style.display = "inline";
                                document.getElementById(idUnlock).style.display = "none";
                            }
                    }>
                        <Text>Unlock</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={hiddenButtonTags}
                        id={idCancel}
                        onClick={
                            () => {
                                document.getElementById(idConfirm).style.display = "none";
                                document.getElementById(idCancel).style.display = "none";
                                document.getElementById(idUnlock).style.display = "inline";
                            }
                    }>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={hiddenButtonTags}
                        id={idConfirm}
                        onClick={
                            () => {
                                this.props.onConfirm(_id, price);
                            }
                    }><Text>Confirm</Text></TouchableOpacity>
                </View>
            </View>
        )
    }
}
