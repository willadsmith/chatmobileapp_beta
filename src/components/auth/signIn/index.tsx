import React, { Component, Fragment } from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { authorizedSelector, errorsSelector, isLoadingSelector, signIn } from '../../../ducks/auth';
import SignInForm from './forms/SignInForm';
import Logo from '../../../assets/images/logo/Logo.png';
import TextSegoe from "../../common/TextSegoe";
import LocalizedText from '../../common/LocalizedText';
import { rootPasswordResetScreen } from '../../../navigation/nagivation';
import { primary, danger } from '../../../assets/app.style';

interface IAuthScreen {
    signIn: (email: string, password: string) => any;
    errors: any;
    isAuthorized: boolean;
    isLoading: boolean;
}

class AuthScreen extends Component<IAuthScreen, any> {
    public render () {
        return (
            <Fragment>
                <View style={styles.container}>
                    <View style={styles.content}>
                        <Image source={Logo}/>
                        <SignInForm
                            signIn={this.props.signIn}
                            isLoading={this.props.isLoading}
                        />
                        <TouchableOpacity onPress={rootPasswordResetScreen}>
                            <TextSegoe style={styles.forgotPassword}>Forgot password?</TextSegoe>
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
    isAuthorized: authorizedSelector(state),
    isLoading: isLoadingSelector(state)
}), { signIn  })(AuthScreen);
