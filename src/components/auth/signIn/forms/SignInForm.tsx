import React, { Component } from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import { Field, reduxForm } from 'redux-form';
import renderInput from '../../../common/renderInput';
import emailValidator from 'email-validator';
import CustomButton from '../../../common/CustomButton';
import LocalizedText from '../../../common/LocalizedText';

interface ISignInForm {
    handleSubmit: any;
    signIn: (email: string, password: string) => any;
    isLoading: boolean;
}

class SignInForm extends Component<ISignInForm, any> {
    public render () {
        const { handleSubmit } = this.props;

        return (
            <View style={styles.container}>
                <Field
                    textContentType={'emailAddress'}
                    autoCapitalize={'none'}
                    placeholder={'Enter email'}
                    keyboardType={'email-address'}
                    title={'E-mail'}
                    name="email"
                    component={renderInput}
                />
                <Field
                    textContentType={'password'}
                    secureTextEntry={true}
                    autoCapitalize={'none'}
                    placeholder={'Enter password'}
                    containerStyle={styles.passwordContainerStyle}
                    title={'Password'}
                    name="password"
                    component={renderInput}
                />
                <CustomButton
                    onPress={handleSubmit(this.submit)}
                    isLoading={this.props.isLoading}
                    containerStyle={styles.submitButtonContainer}
                >Login</CustomButton>
            </View>
        );
    }

    public submit = ({ email, password }: any) => {
        this.props.signIn(email, password);
    };

}

const styles = StyleSheet.create({
    container: {
        marginTop: 110,
        alignSelf: 'stretch',
    },
    submitButtonContainer: {
        marginTop: 38,
    },
    passwordContainerStyle: {
        marginTop: 40
    }
});


const validate = ({ email, password }: any) => {
    const errors: any = {};

    if (!email) {
        errors.email = <LocalizedText path={'validation.email.required'}/>;
    }
    if (email && !emailValidator.validate(email)) {
        errors.email = <LocalizedText path={'validation.email.invalid'}/>;
    }
    if (!password) {
        errors.password = <LocalizedText path={'validation.password.required'}/>;
    }
    return errors;
};


export default reduxForm({
    form: 'SignInForm',
    validate
})(SignInForm);
