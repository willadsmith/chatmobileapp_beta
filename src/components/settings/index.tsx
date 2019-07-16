import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { authSelector, logout, userSelector } from '../../ducks/auth';
import TextSegoe from "../common/TextSegoe";
import Icon from 'react-native-vector-icons/Ionicons';
import { STATIC_SERVER } from '../../configs';
import CustomImage from '../common/CustomImage';
import defaultAvatar from '../../assets/images/defaultAvatar/defaultAvatar.png';
import { pushPasswordChangeScreen, pushProfileScreen } from '../../navigation/nagivation';
import Switch from '../common/Switch';

interface ISettingsScreen {
    logout: () => any;
    user: any;
    auth: any;
    componentId: any;
}

class SettingsScreen extends PureComponent<ISettingsScreen, any> {
    public render () {
        const { user } = this.props;
        return (
            <ScrollView style={styles.container}>
                <TouchableOpacity onPress={() => pushProfileScreen(this.props.componentId)} style={[styles.row, styles.profileRow]}>
                    <View style={styles.profileWrapper}>
                        <CustomImage
                            imageStyle={styles.avatar}
                            uri={`${STATIC_SERVER}/public/files/user/${user.id}/thumb_m/${user.info.avatar}`}
                            defaultSource={defaultAvatar}
                        />
                        <View style={styles.profileInfo}>
                            <TextSegoe bold={true}>{user.info.name}</TextSegoe>
                            {user.info.status && (<TextSegoe style={styles.status}>{user.info.status}</TextSegoe>)}
                        </View>
                    </View>
                    <View>
                        <Icon name={'ios-arrow-forward'} size={23} color={'#D1D1D1'}/>
                    </View>
                </TouchableOpacity>
                <View style={styles.row}>
                    <TextSegoe style={styles.rowText}>Push Notifications</TextSegoe>
                    <Switch/>
                </View>
                <TouchableOpacity style={styles.row} onPress={() => pushPasswordChangeScreen(this.props.componentId)}>
                    <TextSegoe style={styles.rowText}>Change password</TextSegoe>
                    <Icon name={'ios-arrow-forward'} size={23} color={'#D1D1D1'}/>
                </TouchableOpacity>
                <TouchableOpacity style={styles.row} onPress={this.handleLogout}>
                    <TextSegoe style={styles.logoutText}>Log out</TextSegoe>
                </TouchableOpacity>
            </ScrollView>
        );
    }

    public handleLogout = () => {
        this.props.logout();
    };

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F2'
    },
    row: {
        minHeight: 69,
        marginTop: 34,
        backgroundColor: '#fff',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 16,
        paddingRight: 16,
    },
    rowText: {
        fontSize: 16,
    },
    profileRow: {
        marginTop: 0,
        paddingTop: 24,
        paddingBottom: 24,
    },
    logoutText: {
        color: '#FF0000',
        fontSize: 16
    },
    avatar: {
        width: 62,
        height: 62,
        borderRadius: 31
    },
    profileWrapper: {
        flexDirection: 'row',
        flex: 1

    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 23
    },
    status: {
        color: '#5F5F5F',
        fontSize: 14
    }
});

export default connect((state: any) => ({
    user: userSelector(state),
    auth: authSelector(state)
}), {
    logout,
})(SettingsScreen);
