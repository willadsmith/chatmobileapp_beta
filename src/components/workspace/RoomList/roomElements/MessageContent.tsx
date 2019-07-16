import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { PUBLIC_PATH, STATIC_DOMAIN_NAME } from '../../../../configs';
import {checkIfStringContainsURLs, checkIfStringIsURL, isJson} from '../../../../utils/common';
import SystemMessage from './systemMessage';
import { MESSAGE_TYPES } from '../../../../ducks/workspace/rooms';
import { LightBox } from 'react-native-lightbox';
import HTMLView from 'react-native-htmlview';
import IconGenerator from '../../../common/IconGenerator';
import { toggleLightBox } from "../../../../ducks/workspace/workspace";

interface IMessage {
    appId: number;
    roomHash: any;
    userId: number;
    userInfo: {
        name?: string;
        surname?: string;
        avatar?: string;
        bot?: boolean;
    };
    currentChatUserId: number;
    content: any;
    time: string;
    type: number;
}

export default class MessageContent extends Component<IMessage, any> {

    public render () {
        const { type } = this.props;


        const messageCont = this.getMessageContent();
        if (messageCont === null) {
            return null;
        }

        if (type === 0 || type === 1) {
            return (
                this.getMessageBody(messageCont)
            );
        }
        return this.getMessageBody(messageCont);
    }

    private getMessageBody (messageCont: any) {
        const { userInfo, type } = this.props;
        if (!userInfo) {
            return null;
        }
        if (type === 11) {
            return messageCont;
        }
        return (
            <View>
                {messageCont}
            </View>
        );
    }

    private getMessageContent () {
        const { roomHash, content, time, type } = this.props;
        console.log('ttt getMessageContent',content);
        switch (type) {
            case 0:
            case 1:
                if (content.type && content.type === MESSAGE_TYPES.sticker) {
                    return this.getStickerBody();
                }
                if (isJson(content.text)) {
                    return null;
                }
                return (
                    <Text>{this.checkMessageContent(content.text)}</Text>
                );

            case 2:
                return (
                    <Text>{this.checkMessageContent(content.text)}</Text>
                );

            case 5:
                return (
                    <View>
                        <View>
                            {time}
                        </View>
                        {content.isImage || content.isGif ?
                            (
                                <View>
                                    <Text>uploaded image:</Text>
                                    <LightBox
                                        url={`${STATIC_DOMAIN_NAME}/${content.category}/${roomHash}/${!content.isGif ? 'thumb/' : ''}${content.fileName}`}
                                        defaultUrl={`${PUBLIC_PATH}/images/imageNotFound.jpeg`}
                                        onClick={this.handleImageClick.bind(this, content.fileName)}
                                    />
                                </View>
                            ):(
                                <View>
                                    uploaded file:
                                    <LightBox
                                        download={content.fileName}
                                        href={`${STATIC_DOMAIN_NAME}/${content.category}/${roomHash}/${content.fileName}`}>
                                        <View>
                                            <IconGenerator iconType={'file'}/>
                                            <Text>{content.text}</Text>
                                        </View>
                                    </LightBox>
                                </View>
                            )
                        }
                    </View>
                );

            case 6:
                return this.getStickerBody();
            case 7:
                return (
                    <View>
                        <View>
                            <Text>sending error</Text>
                        </View>
                        <View>
                            <Text>
                                {this.checkMessageContent(content.text)}
                            </Text>
                        </View>
                    </View>
                );
            case 10:
                if (content.action === 'form') {
                    return (
                        <View>
                            <Text>
                                <Text>{content.value}</Text>
                            </Text>
                        </View>
                    );
                }
                if (content.action === 'selector') {
                    return (
                        <Text>
                            <Text>{content.name}</Text>
                        </Text>
                    );
                }
                return null;
            case 11:
                return (
                    <SystemMessage
                        content={content.text}
                    />
                );

            default:
                return null;
        }
    }

    private checkMessageContent = (message: any) => {
        let newMessage = message;
        if (checkIfStringContainsURLs(message)) {
            const words = message.split(/\s+/);
            for (const word of words) {
                if (checkIfStringIsURL(word)) {
                    newMessage = newMessage.replace(word, `<a href="${word.substr(0, 4) === 'http' ? word : `http://${word}`}" target="_blank" class="ivcbox-link">${word}</a>`);
                }
            }
            return (
                <HTMLView value={newMessage}/>
            );
        }
        return message;
    };

    private getStickerBody () {
        const { content } = this.props;
        return (
            <View>
                <Text>{content.text}</Text>
            </View>
        );
    }

    private handleImageClick (url: string) {
        const { roomHash, content } = this.props;

        toggleLightBox(STATIC_DOMAIN_NAME + '/' + content.category + '/' + roomHash + '/' + url);
    }

}
