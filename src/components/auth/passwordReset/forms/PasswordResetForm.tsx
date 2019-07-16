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
import TextSegoe from '../../../common/TextSegoe';

interface IPasswordResetForm {
    handleSubmit: any;
    passwordReset: (email: string) => any;
    isLoading: boolean;
}

class PasswordResetForm extends Component<IPasswordResetForm, any> {
    public render () {
        const { handleSubmit } = this.props;

        return (
            <View style={styles.container}>
                <TextSegoe style={styles.title} bold={true}>Password recovery</TextSegoe>
                <Field
                    textContentType={'emailAddress'}
                    autoCapitalize={'none'}
                    placeholder={'Enter email'}
                    keyboardType={'email-address'}
                    title={'E-mail'}
                    name="email"
                    component={renderInput}
                />
                <CustomButton
                    onPress={handleSubmit(this.submit)}
                    isLoading={this.props.isLoading}
                    containerStyle={styles.submitButtonContainer}
                >
                    Reset
                </CustomButton>
                <TextSegoe style={styles.passwordRecoveryText}>Enter your email to send you a verification code</TextSegoe>

            </View>
        );
    }

    public submit = ({ email }: any) => {
        this.props.passwordReset(email);
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
    containerStyle: {
        marginTop: 40
    },
    title: {
        textAlign: 'center',
        marginBottom: 50
    },
    passwordRecoveryText: {
        textAlign: 'center',
        color: '#5F5F5F',
        marginTop: 28
    }
});

const validate = ({ email }: any) => {
    const errors: any = {};

    if (!email) {
        errors.email = <LocalizedText path={'validation.email.required'}/>;
    }
    if (email && !emailValidator.validate(email.trim())) {
        errors.email = <LocalizedText path={'validation.email.invalid'}/>;
    }
    return errors;
};


export default reduxForm({
    form: 'PasswordResetForm',
    validate
})(PasswordResetForm);
