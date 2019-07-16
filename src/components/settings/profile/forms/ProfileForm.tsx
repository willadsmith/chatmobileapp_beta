import React, { PureComponent, Fragment } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { connect } from 'react-redux';
import { authSelector, userSelector, updateUserInfo, isLoadingSelector, startLoading, stopLoading } from '../../../../ducks/auth';
import renderInput from '../../../common/renderInput';
import { Navigation } from 'react-native-navigation';
import TextSegoe from '../../../common/TextSegoe';
import { STATIC_SERVER } from '../../../../configs';
import CustomImage from '../../../common/CustomImage';
import defaultAvatar from '../../../../assets/images/defaultAvatar/defaultAvatar.png';
import Icon from 'react-native-vector-icons/Ionicons';
import { primary } from '../../../../assets/app.style';
import ImagePicker from 'react-native-image-picker';
import LocalizedText from '../../../common/LocalizedText';
import { reduxForm, Field, formValueSelector } from 'redux-form';
import { areObjectsEqual, randomString } from '../../../../utils/common';
import RNFetchBlob from 'rn-fetch-blob';
import ModalLoader from '../../../common/ModalLoader';

interface IProfileForm {
    user: any;
    authToken: string;
    componentId: string;
    handleSubmit: any;
    updateUserInfo: (name: string, surname: string, statusMessage: string, avatar: string, payload: any) => any;
    formValues: any;
    change: any;
    isLoading: boolean;
    startLoading: () => any;
    stopLoading: () => any;
    initialValues: any;
}

class ProfileForm extends PureComponent<IProfileForm, any> {

    public submitButton: any;

    constructor (props: any) {
        super (props);
        Navigation.events().bindComponent(this);
        this.state = {
            pickedImage: null,
            pickedImageData: null,
            didInfoChange: false

        };
    }

    public componentDidMount () {
        const { user } = this.props;
        this.setState({
            pickedImage: `${STATIC_SERVER}/public/files/user/${user.id}/thumb_m/${user.info.avatar}`
        });
    }

    public componentDidUpdate (prevProps: any) {
        if (prevProps.formValues.info && !areObjectsEqual(prevProps.formValues.info, this.props.formValues.info)) {
            this.updateTopBarButtons();
        }
    }

    public render () {
        const { user } = this.props;

        if (!this.state.pickedImage) {
            return null;
        }
        return (
            <Fragment>
                {this.props.isLoading && (<ModalLoader title={'Updating profile...'}/>)}
                <View style={styles.profileWrapper}>
                    <TouchableOpacity style={styles.avatarWrapper} onPress={this.pickImageHandler}>
                        <CustomImage
                            imageStyle={styles.avatar}
                            uri={this.state.pickedImage}
                            defaultSource={defaultAvatar}
                        />
                        <View style={styles.cameraIconWrapper}>
                            <Icon name={'ios-camera'} size={30} style={styles.cameraIcon}/>
                        </View>

                    </TouchableOpacity>
                    <View style={styles.profileInfo}>
                        <TextSegoe bold={true}>{user.info.name}</TextSegoe>
                        {user.info.status && (<TextSegoe style={styles.subtitle}>{user.info.status}</TextSegoe>)}
                    </View>
                </View>
                <View style={styles.infoContainer}>
                    <TextSegoe bold={true}>Profile information</TextSegoe>
                    <TextSegoe style={styles.subtitle}>To make changes, just click on the data.</TextSegoe>
                </View>
                <View>
                    <Field name="info.name" title="Name" component={renderInput} />
                    <Field name="info.surname" title="Surname" containerStyle={styles.inputContainer} component={renderInput} />
                    <Field multiline={true} name="info.statusMessage" title="Status" containerStyle={styles.inputContainer} component={renderInput} />
                    <TouchableOpacity
                        ref={(ref: any) => this.submitButton = ref}
                        onPress={this.props.handleSubmit(this.submit)}
                        style={styles.submitButton}
                    />
                </View>
            </Fragment>
        );
    }
    public pickImageHandler = () => {
        const options = {
            title: 'Select Avatar',
            maxWidth: 1200,
            maxHeight: 900
        };
        ImagePicker.showImagePicker(options, (response: any) => {

            if (response.didCancel) {
                // empty
            } else {
                this.setState({
                    pickedImage: response.uri,
                    pickedImageData: response.data
                }, () => {
                    this.props.change('info.avatar', this.state.pickedImage);
                });
            }
        });
    };

    public navigationButtonPressed = ({ buttonId }: any) => {
        if (buttonId === 'profileSave') {
            this.submitButton.props.onPress();
        } else if (buttonId === 'backButton') {
            if (!areObjectsEqual(this.props.formValues.info, this.props.initialValues.info)) {
                Alert.alert(
                    'Close without saving',
                    `You'll lose the changes you've made if you leave`,
                    [
                        { text: 'Keep editing' },
                        { text: 'Close without saving', onPress: () => Navigation.pop(this.props.componentId) },
                    ],
                    { cancelable: false }
                );
            } else {
                Navigation.pop(this.props.componentId);
            }
        } else {
            alert(buttonId);
        }
    };
    public submit = ({ info: { name, surname, statusMessage } }: any) => {
        if (this.state.pickedImageData) {
            const { user, authToken } = this.props;
            this.props.startLoading();
            RNFetchBlob.fetch('POST', STATIC_SERVER + '/files/upload', {
                authorization : authToken,
                'Content-Type' : 'multipart/form-data',
            }, [
                // element with property `filename` will be transformed into `file` in form data
                { name : 'category', data: 'user'},
                { name : 'subcategory', data: user.id },
                { name : 'hash', data: randomString(15)},
                { name : 'file', filename : 'avatar.png', data: this.state.pickedImageData},
            ]).then((resp: any) => {
                console.log('ttt resp', resp.json().file.name);
                this.props.updateUserInfo(name, surname, statusMessage, resp.json().file.name, { componentId: this.props.componentId });
            }).catch((err: any, statusCode: any) => {
                this.props.stopLoading();
                console.log('ttt catch', err);
            });
            return;
        }
        this.props.updateUserInfo(name, surname, statusMessage, this.props.user.info.avatar, { componentId: this.props.componentId });
        console.log('ttt name name', name);
    };

    public updateTopBarButtons = () => {
        if (areObjectsEqual(this.props.formValues.info, this.props.initialValues.info)) {
            Navigation.mergeOptions(this.props.componentId, {
                topBar: {
                    rightButtons: []
                }
            });
        } else {
            Promise.all([
                Icon.getImageSource('ios-checkmark', 40),
            ]).then((sources: any) => {
                Navigation.mergeOptions(this.props.componentId, {
                    topBar: {
                        rightButtons: [
                            {
                                id: 'profileSave',
                                icon: sources[0],
                                color: '#FFF'
                            }
                        ]

                    }
                });
            });

        }
    };

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        flex: 1,
        padding: 16
    },
    infoContainer: {
        marginTop: 34,
        marginBottom: 45
    },
    subtitle: {
        fontSize: 14,
        color: '#5F5F5F',
        marginTop: 15
    },
    inputContainer: {
        marginTop: 38
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44
    },
    profileWrapper: {
        flexDirection: 'row'
    },
    profileInfo: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 23
    },
    avatarWrapper: {
        position: 'relative',
    },
    cameraIconWrapper: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: primary,
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cameraIcon: {
        color: '#FFF'
    },
    submitButton: {
        display: 'none'
    }

});

const validate = ({ info = { name: null, surname: null, avatar: null }}: any) => {
    const errors: any = { info: {}};
    if (!info.name) {
        errors.info.name = <LocalizedText path={'validation.info.name.required'}/>;
    }
    if (!info.surname) {
        errors.info.surname = <LocalizedText path={'validation.info.surname.required'}/>;
    }
    return errors;
};

function mapStateToProps (state: any, ownProps: any) {
    const selector = formValueSelector('profileInfo');

    return {
        initialValues: {
            info: {
                name: ownProps.user.info.name ? ownProps.user.info.name : '',
                surname: ownProps.user.info.surname ? ownProps.user.info.surname : '',
                avatar: ownProps.user.info.avatar ? ownProps.user.info.avatar : '',
                statusMessage: ownProps.user.info.statusMessage ? ownProps.user.info.statusMessage : ''
            }
        },
        formValues: {
            info: selector(state, 'info')
        },
        user: userSelector(state),
        authToken: authSelector(state).token,
        isLoading: isLoadingSelector(state)

    };
}


export default connect(mapStateToProps, {
    updateUserInfo,
    startLoading,
    stopLoading
})(reduxForm({
    form: 'profileInfo',
    validate,
    enableReinitialize: true
})(ProfileForm));
