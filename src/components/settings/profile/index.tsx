import React, { PureComponent } from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { authSelector, userSelector, updateUserInfo } from '../../../ducks/auth';
import ProfileForm from './forms/ProfileForm';

interface IProfile {
    user: any;
    authToken: string;
    componentId: string;
    updateUserInfo: (name: string, surname: string, statusMessage: string, avatar: string) => any;
}

class Profile extends PureComponent<IProfile, any> {

    public render () {
        return (
            <ScrollView style={styles.container}>
                <ProfileForm
                    user={this.props.user}
                    authToken={this.props.authToken}
                    updateUserInfo={this.props.updateUserInfo}
                    componentId={this.props.componentId}
                />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        padding: 16
    },
});



export default connect((state: any) => ({
    user: userSelector(state),
    authToken: authSelector(state).token
}), {
    updateUserInfo
})(Profile);
