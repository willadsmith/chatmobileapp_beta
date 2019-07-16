import React, { PureComponent, Fragment } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Logo from '../../../assets/images/logo/Logo.png';
import TextSegoe from "../../common/TextSegoe";
import LocalizedText from '../../common/LocalizedText';

import { connect } from 'react-redux';
import { errorsSelector, isLoadingSelector, messageSelector, passwordReset } from "../../../ducks/auth";
import PasswordResetForm from './forms/PasswordResetForm';
import { rootAuthScreen } from '../../../navigation/nagivation';
import { danger, primary } from '../../../assets/app.style';

interface IPasswordreset {
    errors: any;
    message: any;
    passwordReset: (email: string) => any;
    isLoading: boolean;
}
class PasswordReset extends PureComponent<IPasswordreset, any> {
    public render () {
        return (
            <Fragment>
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Image source={Logo}/>
                        <PasswordResetForm
                            passwordReset={this.props.passwordReset}
                            isLoading={this.props.isLoading}
                        />
                        <TouchableOpacity onPress={rootAuthScreen}>
                            <TextSegoe style={styles.forgotPassword}>Return to login</TextSegoe>
                        </TouchableOpacity>
                    </View>
                </View>
                <View>
                    <TextSegoe style={styles.errorMessage}>{this.props.errors.message ? (<LocalizedText path={'serverValidation.' + this.props.errors.message}/>) : ' '}</TextSegoe>
                </View>
            </Fragment>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        alignSelf: 'stretch',
        padding: 16,
    },
    forgotPassword: {
        textDecorationLine: 'underline',
        marginTop: 31,
        color: primary
    },
    errorMessage: {
        color: danger,
        marginBottom: 24,
        textAlign: 'center'
    }
});


export default connect((state: any) => ({
    errors: errorsSelector(state),
    message: messageSelector(state),
    isLoading: isLoadingSelector(state)
}), {
    passwordReset
})(PasswordReset);
