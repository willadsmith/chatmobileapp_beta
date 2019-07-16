import React, { PureComponent } from 'react';
import { TouchableOpacity, View } from 'react-native';
import AsyncStorage  from '@react-native-community/async-storage';
import { MESSAGE_TYPES } from '../../../../ducks/workspace/rooms';
import { STATIC_SERVER } from '../../../../configs';
import { randomString } from '../../../../utils/common';
import { dispatch } from '../../../../store';
import { REFRESH } from '../../../../configs/types';
import Icon from 'react-native-vector-icons/Ionicons';
import ImagePicker from "react-native-image-picker";

interface IFileUploader {
    user: any;
    currentRoomApp: any;
    roomHash: string;
    sendMessage: (payload: any) => any;
    authToken: string;
    content: any;
}

class FileUploader extends PureComponent<IFileUploader, any> {

    public fileInput: any;

    public xhrUploadArray: any;

    public constructor (props: any) {
        super(props);
        this.handleUploadFile = this.handleUploadFile.bind(this);
        this.xhrUploadArray = [];
    }

    public render () {
        return (
            <TouchableOpacity
                ref={(ref: any) => { this.fileInput = ref; }}
                onPress={this.pickImageHandler}>
                <View style={{
                    marginTop: 5,
                    marginBottom: 5,
                    marginLeft: 5,
                    marginRight: 5,
                    width: 46,
                    height: 46,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: "#fff",
                    padding: 13,
                    borderRadius: 360}}>
                    <Icon name={'ios-attach'} size={32} style={{
                        transform: [{ rotate: '45deg' }],
                        color: "#2196F3"
                    }}/>
                </View>
            </TouchableOpacity>
        );
    }

    private handleUploadFile () {
        const self = this;
        const { currentRoomApp, roomHash } = this.props;

        const files = [].slice.call(this.fileInput);
        console.log('ttt handleUploadFile', this.fileInput);
        files.forEach((file: any) => {
            const generatedFileName = randomString(15);
            const fileExtension = String(/[^.]+$/.exec(file.name));
            const fileHashName = generatedFileName + '.' + fileExtension;
            const messageHash = randomString(8);
            const payload = {
                message: {
                    hash: messageHash,
                    text: file.name,
                    fileName: fileHashName,
                    isImage: (['jpg', 'png', 'jpeg'].indexOf(fileExtension) > -1),
                    isGif: (['gif'].indexOf(fileExtension) > -1),
                    category: 'app'
                },
                type: MESSAGE_TYPES.fileLink,
                modificator: 'finalMessage'
            };

            const params = {
                appId: currentRoomApp.id,
                hash: generatedFileName,
                file,
                payload
            };
            self.uploadFile(roomHash, params);
        });
    }

    private uploadFile (roomHash: string, params: {
        appId: string;
        hash: string;
        file: File;
        payload: any;
    }) {
        const self = this;
        const { payload } = params;

        const prePayload = Object.assign({}, payload);
        prePayload.modificator = 'preMessage';
        this.props.sendMessage(prePayload);

        const formData = new FormData();
        formData.append('is_user', '1');
        formData.append('category', 'app');
        formData.append('subcategory', roomHash);
        formData.append('hash', params.hash);
        formData.append('file', params.file);

        this.xhrUploadArray[roomHash] = new XMLHttpRequest();
        this.xhrUploadArray[roomHash].timeout = 60000;
        this.xhrUploadArray[roomHash].onreadystatechange = (e: any) => {
            if (self.xhrUploadArray[roomHash].readyState === 4) {
                if (self.xhrUploadArray[roomHash].status === 200) {
                    const response = JSON.parse(self.xhrUploadArray[roomHash].responseText);
                    if (response.status === true) {
                        const responsePayload = {
                            ...payload,
                            message: {
                                ...payload.message,
                                fileName: response.file.name
                            }
                        };
                        self.props.sendMessage(responsePayload);
                    } else {
                        self.handleFileError(payload.message.hash, response, { roomHash, params });
                    }
                } else {
                    self.handleFileError(payload.message.hash, null, null);
                }
                self.xhrUploadArray.splice(self.xhrUploadArray.indexOf(roomHash), 1);
            }
        };

        this.xhrUploadArray[roomHash].ontimeout = (e: any) => {
            this.handleFileError(payload, null, null);
        };
        this.xhrUploadArray[roomHash].open('POST', STATIC_SERVER + '/files/upload', true);
        this.xhrUploadArray[roomHash].setRequestHeader('authorization', JSON.parse(AsyncStorage.getItem('ivcUser') || '{}').sessionKey);
        this.xhrUploadArray[roomHash].send(formData);
    }

    private pickImageHandler = () => {
        const options = {
            title: 'Select File',
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
                    this.handleUploadFile();
                });
            }
        });
    };

    private handleFileError (messageHash: string, response: any, payload: any) {
        if (payload && response && response.message === 'jwt expired') {
            return new Promise((resolve: any, reject: any) => {
                dispatch({
                    type: REFRESH,
                    payload: {
                        resolve,
                        reject,
                    }
                });
            }).then(() => {
                this.uploadFile(payload.roomHash, payload.params);
            });
        }
        const message = {
            message: {
                hash: messageHash,
                text: 'File upload error'
            },
            type: MESSAGE_TYPES.text,
            modificator: 'preMessage'
        };
        this.props.sendMessage(message);
        return;
    }


}


export default FileUploader;
