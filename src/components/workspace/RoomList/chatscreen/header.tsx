import React, { PureComponent } from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { rootTabsScreen } from '../../../../navigation/nagivation';
import avatar from '../defaultAvatar/defaultAvatar.png';

class RoomHeader extends PureComponent<any, any> {

    public render () {

        const {room} = this.props;

        return (
            <View>
                <View style={styles.header}>
                    <View style={styles.back}>
                        <TouchableOpacity onPress={rootTabsScreen}>
                            <Icon name={'ios-arrow-round-back'} size={56} style={{color: '#fff'}}/>
                        </TouchableOpacity>
                    </View>
                    <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                        <View style={styles.rowTextUp}>
                            <Text style={{ color: '#fff', fontFamily: 'SegoeUI-Bold' }}>Sales department</Text>
                        </View>
                        <View style={styles.rowTextDown}>
                            <Icon name={'ios-radio-button-on'} size={12} style={{color: '#fff'}}/>
                            <Text style={{color: '#fff'}}> online</Text>
                        </View>
                    </View>
                    <View style={styles.place}>
                        <Image source={avatar} style={styles.avatar}/>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    header: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: "#2196F3",
        padding: 33
    },
    place: {
        position: 'absolute',
        right: 6,
        marginTop: 5,
        width: 48,
        height: 48
    },
    avatar: {
        height: 48,
        width: 48
    },
    rowTextUp: {
        marginTop: -5,
        alignItems: 'center',
        flex: 1,
        color: '#fff'
    },
    rowTextDown: {
        marginTop: 30,
        alignItems: 'center',
        flex: 1,
        color: '#fff',
        flexDirection: 'row'
    },
    back: {
        position: 'absolute',
        left: 15,
        width: 30,
        height: 30
    }
});

export default RoomHeader;
