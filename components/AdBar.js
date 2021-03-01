import React from 'react';
import {AdMobBanner} from 'expo-ads-admob';
import {View, Platform, Text} from 'react-native';
import {adMobConfig} from '../config';

export default function AdBar(props) {
    let style = {
		position: 'absolute',
		flex: 1,
		width: '100%',
	},
	style1 = {
        alignItems: 'center',
		justifyContent: 'center',
    }
    if (props.top) 
        style.top = 0;
    else 
        style.bottom = 0;
    


    if (Platform.OS == 'android' || Platform.OS == 'ios') {
		return (
			<View style={style}>
				<View style={style1}>
					<AdMobBanner adSize="smartBannerPortrait"
					adUnitID={
						adMobConfig.AdBarID
					}/>
				</View>
			</View>
		);   
    }else{
		return(
			<View style={style}>
				<Text>web ad</Text>
				</View>
		)
	}
}
