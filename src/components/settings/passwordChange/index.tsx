import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { reduxForm, Field, SubmissionError } from 'redux-form';
import LocalizedText from '../../common/LocalizedText';
import renderInput from "../../common/renderInput";
import CustomButton from '../../common/CustomButton';
import { connect } from 'react-redux';
import { errorsSelector, isLoadingSelector, updateUserPassword } from '../../../ducks/auth';
import { processErrors } from '../../../utils/validation';

interface IPasswordChange {
    handleSubmit: any;
    isLoading: boolean;
    updateUserPassword: (values: { oldPassword: string, password: string, passwordConfirmation: string }, payload: { reject: any, resolve: any, componentId: string }) => any;
    errors: any;
    componentId: string;
}

class PasswordChange extends PureComponent<IPasswordChange , any> {

    public render () {
        const { handleSubmit } = this.props;
        return (
            <View style={styles.container}>
                <View style={styles.formContainer}>
                    <Field
                        textContentType={'password'}
                        secureTextEntry={true}
                        autoCapitalize={'none'}
                        placeholder={'Enter old password'}
                        title={'Old password'}
                        name="oldPassword"
                        component={renderInput}
                    />
                    <Field
                        textContentType={'password'}
                        secureTextEntry={true}
                        autoCapitalize={'none'}
                        placeholder={'Enter new password'}
                        title={'Old password'}
                        name="password"
                        containerStyle={styles.passwordContainer}
                        component={renderInput}
                    />
                    <Field
                        textContentType={'password'}
                        secureTextEntry={true}
                        autoCapitalize={'none'}
                        placeholder={'Enter password confirmation'}
                        title={'Password confirmation'}
                        containerStyle={styles.passwordContainer}
                        name="passwordConfirmation"
                        component={renderInput}
                    />
                    <CustomButton
                        onPress={handleSubmit(this.handlePasswordChange)}
                        isLoading={this.props.isLoading}
                        containerStyle={styles.submitButtonContainer}
                    >Change password</CustomButton>
                </View>
            </View>
        );
    }
    public handlePasswordChange = ({ oldPassword, password, passwordConfirmation }: any) => {
        return new Promise((resolve, reject) => {
            this.props.updateUserPassword({ oldPassword, password, passwordConfirmation }, { reject, resolve, componentId: this.props.componentId});
        }).catch(() => {
            throw new SubmissionError(processErrors(this.props.errors.errors));
        });

    };
}

const validate = ({ oldPassword, password, passwordConfirmation }: any) => {
    const errors: any = {};

    if (!oldPassword) {
        errors.oldPassword = <LocalizedText path={'validation.oldPassword.required'}/>;
    }
    if (!password) {
        errors.password = <LocalizedText path={'validation.password.required'}/>;
    }
    if (password && password.length < 8) {
        errors.password = <LocalizedText path={'validation.password.password_short'}/>;
    }
    if (passwordConfirmation !== password) {
        errors.passwordConfirmation = <LocalizedText path={'validation.passwordConfirmation.not_confirmed'}/>;
    }
    if (!passwordConfirmation) {
        errors.passwordConfirmation = <LocalizedText path={'validation.passwordConfirmation.required'}/>;
    }
    return errors;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formContainer: {
        alignSelf: 'stretch',
        paddingLeft: 16,
        paddingRight: 16,
    },
    passwordContainer: {
        marginTop: 40
    },
    submitButtonContainer: {
        marginTop: 76
    }
});

export default connect((state: any) => ({
    isLoading: isLoadingSelector(state),
    errors: errorsSelector(state),

}), {
    updateUserPassword
})(reduxForm({
    form: 'passwordChange',
    validate
})(PasswordChange));
