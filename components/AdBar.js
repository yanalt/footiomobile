import React from 'react';
import {AdMobBanner} from 'expo-ads-admob';
import {View, Platform, Text} from 'react-native';
import {adMobConfig} from '../config';

export default function AdBar(props) {
    let style = {
        position: 'absolute',
        right: 0,
        width: '100%'
    }
    if (props.top) 
        style.top = 0;
    else 
        style.bottom = 0;
    


    if (Platform.OS == 'android' || Platform.OS == 'ios') {
		return (
			<View style={style}>
	
				<AdMobBanner adSize="smartBannerPortrait"
					adUnitID={
						adMobConfig.AdBarID
					}/></View>
		);   
    }else{
		return(
			<View style={style}>
				<Text>web ad</Text>
				</View>
		)
	}
}
