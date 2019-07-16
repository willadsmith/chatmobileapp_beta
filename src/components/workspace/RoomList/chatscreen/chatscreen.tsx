/* eslint-disable no-undef */
import React, { PureComponent } from 'react';
import {
    StyleSheet,
    View,
    TextInput,
    KeyboardAvoidingView,
    TouchableOpacity,
    Image,
    StatusBar,
    Text,
    FlatList,
    Animated,
    Linking
} from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import { connect } from 'react-redux';
import RoomHeader from './header';
import {appSelector, dashboardUsersSelector, lightBoxUrlSelector} from '../../../../ducks/workspace/workspace';
import {
    currentRoomMessagesSelector, currentRoomSelector, currentRoomAssignedSelector, currentRoomAppIdSelector,
    currentRoomLastSeenMessageSelector, currentRoomUsersMapSelector, currentRoomTypingUsersSelector,
    sendMessage, sendTypingSignal, updateLastSeenMessage, loadRoom, initRtcConnection, closeRtcConnection
} from '../../../../ducks/workspace/roomCurrent';
import { authSelector, ivcUserSelector, userIdSelector } from '../../../../ducks/auth';
import Send from './icons/send.png';
// import Icon from 'react-native-vector-icons/Ionicons';
import {
    checkIfStringContainsURLs,
    checkIfStringIsURL,
    isJson,
    mapToArr,
    mapToObj,
    randomString
} from '../../../../utils/common';
import { MESSAGE_TYPES, ROOM_STATUSES, SYSTEM_MESSAGE_EVENTS } from '../../../../ducks/workspace/rooms';
import { IvcAdapter } from '../../../../libs/IvcAdapter';
import Svg, {Path} from 'react-native-svg';
import TypeSignal from '../roomElements/TypeSignal';
import FileUploader from '../roomElements/FileUploader';
import { PUBLIC_PATH, STATIC_DOMAIN_NAME } from '../../../../configs';
import SystemMessage from '../roomElements/systemMessage';
import LightBox from 'react-native-lightbox';
import HTMLView from 'react-native-htmlview';
import IconGenerator from '../../../common/IconGenerator';

interface IChatScreen {
    appId: number;
    myUserId: number;
    roomHash: string;
    userId: number;
    authToken: string;
    userInfo: {
        name?: string;
        surname?: string;
        avatar?: string;
    };
    currentChatUserId: number;
    sendMessage: (payload: any) => any;
    sendTypingSignal: (payload: any) => any;
    dashboardUsers: any;
    type: number;
    typingUsers: any[];
    roomMessages: any;
    currentRoom: any;
    currentRoomLastSeenMessage: any;
    currentRoomTypingUsers: any[];
    currentRoomAssigned: boolean;
    updateLastSeenMessage: any;
    user: number;
    ivcUser: any;
    loadRoom: any;
    message: any;
    content: any;
    inverted?: boolean
    renderTime: any;
    currentRoomApp: any;
    scrollToBottomOffset?: number
    invertibleScrollViewProps?: any
    messageCont: any;
    scrollToEnd: any;
}

class ChatScreen extends PureComponent<IChatScreen, any> {

    public messageList: any;

    public lastTypingTime: Date = new Date(new Date().getTime() - 2000);

    public currentRoomLastMessageId = null;

    public state = {
        message: '',
        typing: "",
    };

    public constructor (props: any) {
        super(props);
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
        this.handleSend = this.handleSend.bind(this);
    };

    public componentDidMount () {
        this.setState({a:'a'});
    };

    public componentWillUpdate (prevProps: any) {
        const { currentRoom } = this.props;
        if (currentRoom && !currentRoom.get('loadingStatus')) {
            this.props.loadRoom({ id: currentRoom.get('id') });
        }
        if (prevProps.currentRoom && !prevProps.currentRoomAssigned && this.props.currentRoomAssigned && prevProps.currentRoom.get('status') === ROOM_STATUSES.open && this.props.currentRoom.get('status') === ROOM_STATUSES.active) {
            const textObj = {
                event: SYSTEM_MESSAGE_EVENTS.joinConversation,
                payload: {
                    senderUserId: this.props.ivcUser.userId,
                }
            };
            const systemMessagePayload = {
                message: { 'hash': randomString(8), 'text': JSON.stringify(textObj) },
                type: MESSAGE_TYPES.system
            };
            IvcAdapter.sendSystemMessage(systemMessagePayload);
        }

    }

    public render () {

        const { roomMessages, currentRoomAssigned, currentRoom, currentRoomTypingUsers, currentRoomApp, user, content } = this.props;
        console.log('ttt RoomHash ChatScreen userID', user);
        return (
            <View style={styles.container}>
                <StatusBar backgroundColor="#2196F3" barStyle="light-content"/>
                <RoomHeader style={{ marginTop: 20 }}/>
                <FlatList
                    ref = "FlatList"
                    // @ts-ignore
                    onContentSizeChange={()=> this.refs.FlatList.scrollToEnd({ animated: true })}
                    data = {roomMessages}
                    renderItem = { message => this.renderItem(message)}
                    extraData={this.state}
                    contentContainerStyle={styles.contentContainerStyle}
                    keyExtractor={(item, index) => index.toString()}
                />
                <TypeSignal
                    currentRoomAssigned={currentRoomAssigned}
                    typingUsers={currentRoomTypingUsers}
                    sendTypingSignal={this.props.sendTypingSignal}
                    userId={this.props.userId}
                />
                <KeyboardAvoidingView behavior="height">
                    <View style={styles.footer}>
                        <FileUploader
                            user={user}
                            authToken={this.props.authToken}
                            currentRoomApp={currentRoomApp}
                            roomHash={currentRoom.get('hash')}
                            sendMessage={sendMessage}
                            content={content}/>
                        <TextInput
                            value={this.state.message}
                            onChangeText={text => this.setState({message: text})}
                            style={styles.input}
                            underlineColorAndroid="transparent"
                            placeholder="Write a message..."
                            onChange={this.handleTextareaChange}
                            editable={true}
                            maxLength={265}
                        />
                        <TouchableOpacity onPress={this.handleSend}>
                            <View style={styles.send}>
                                <Image source={Send} style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: 20,
                                    height: 20
                                }}/>
                            </View>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    }

    private getAuthorName (userId: number): string {
        const { myUserId, dashboardUsers } = this.props;
        if (userId === myUserId) {
            return 'You';
        } else {
            const dashboardUsersArr = mapToArr(dashboardUsers);
            const user = dashboardUsersArr.map((u: any) => mapToObj(u)).find((u: any) => {
                return u.id === userId;
            });
            if (!user) {
                return`# ${userId}`;
            }
            return (user.info && user.info.name) || `# ${user.userId}`;
        }
    }

    // typing message
    private renderItem (message: any) {
        const { myUserId, user } = this.props;
        if (![styles.arrowContainer, styles.arrowRightContainer,]) {
            return null;
        }
        return (
            <View ref={(ref: any) => { this.messageList = ref; }}>
                <View>
                    {user === message.item.get('userId') ? (
                        <Animated.View key={message.item.get('id')}>
                            <View style={[styles.item, styles.itemOut]}>
                                <View style={[styles.balloon, {backgroundColor: '#e0f2fe'}]}>
                                    <View style={{paddingTop: 5}}>{this.getMessageContent(message.item.get('content'), message.item.get('type'))}</View>
                                    <View
                                        style={[
                                            styles.arrowContainer,
                                            styles.arrowRightContainer,
                                        ]}
                                    >
                                        <Svg style={styles.arrowRight} width={moderateScale(15.5, 0.6)} height={moderateScale(17.5, 0.6)} viewBox="32.485 17.5 15.515 17.5" enable-background="new 32.485 17.5 15.515 17.5">
                                            <Path
                                                d="M48,35c-7-4-6-8.75-6-17.5C28,17.5,29,35,48,35z"
                                                fill="#e0f2fe"
                                                x="0"
                                                y="0"
                                            />
                                        </Svg>
                                    </View>
                                </View>
                            </View>
                            <Text style={{
                                fontFamily: 'SegoeUI',
                                alignSelf: 'flex-end',
                                marginRight: 20,
                                marginTop: -10
                            }}>{this.getAuthorName(myUserId)}, {(message.item.get('createdAt').getHours() < 10 ? '0' : '') +
                            message.item.get('createdAt').getHours() + ':' +
                            (message.item.get('createdAt').getMinutes() < 10 ? '0' : '') +
                            message.item.get('createdAt').getMinutes()}
                            </Text>
                        </Animated.View>
                    ) : (
                        <Animated.View key={message.item.get('id')}>
                            <View style={[styles.item, styles.itemIn]}>
                                <View style={[styles.balloon, {backgroundColor: '#f2f6f9'}]}>
                                    <View style={{
                                        paddingTop: 5
                                    }}>{this.getMessageContent(message.item.get('content'), message.item.get('type'))}</View>
                                    <View
                                        style={[
                                            styles.arrowContainer,
                                            styles.arrowLeftContainer,
                                        ]}
                                    >
                                        <Svg style={styles.arrowLeft} width={moderateScale(15.5, 0.6)} height={moderateScale(17.5, 0.6)} viewBox="32.484 17.5 15.515 17.5" enable-background="new 32.485 17.5 15.515 17.5">
                                            <Path
                                                d="M38.484,17.5c0,8.75,1,13.5-6,17.5C51.484,35,52.484,17.5,38.484,17.5z"
                                                fill="#f2f6f9"
                                                x="0"
                                                y="0"
                                            />
                                        </Svg>
                                    </View>
                                </View>
                            </View>
                            <Text style={{
                                fontFamily: 'SegoeUI',
                                marginLeft: 20,
                                marginTop: -10
                            }}>Client, {(message.item.get('createdAt').getHours() < 10 ? '0' : '') +
                            message.item.get('createdAt').getHours() + ':' +
                            (message.item.get('createdAt').getMinutes() < 10 ? '0' : '') +
                            message.item.get('createdAt').getMinutes()}
                            </Text>
                        </Animated.View>
                    )}
                </View>
            </View>
        );
    };

    private getMessageContent (content: any, type: number) {
        const { roomHash } = this.props;
        switch (type) {
            case 0:
            case 1:
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
                        {content.isImage || content.isGif ?
                            (
                                <Image
                                    style={{ width: 250, height: 250, borderRadius: 13 }}
                                    source={{ uri: `${STATIC_DOMAIN_NAME}/${content.category}/${this.props.currentRoom.hash}/${!content.isGif ? 'thumb/' : ''}${content.fileName}`}} defaultSource={{ uri: `${PUBLIC_PATH}/images/imageNotFound.jpeg`}}
                                />
                            ):(
                                <View>
                                    <HTMLView
                                        download={content.fileName}
                                        href={`${STATIC_DOMAIN_NAME}/${content.category}/${roomHash}/${content.fileName}`}/>
                                    <IconGenerator iconType={'file'}/>
                                    <Text>{content.text}</Text>
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
                        <Text>sending error</Text>
                        <Text>{this.checkMessageContent(content.text)}</Text>
                    </View>
                );
            case 10:
                if (content.action === 'form') {
                    return (
                        <Text>{content.value}</Text>
                    );
                }
                if (content.action === 'selector') {
                    return (
                        <Text>{content.name}</Text>
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

    private handleTextareaChange (event: any) {
        if (event.target.value !== '\n') {
            this._sendTypingSignal();
            this.setState({
                message: event.target.text
            });
        }
    }

    private _sendTypingSignal () {
        if ((Number(new Date()) - Number(this.lastTypingTime)) > 2000) {
            if (this.props.roomHash) {
                this.lastTypingTime = new Date();
                this.props.sendTypingSignal({ roomHash: this.props.roomHash });
            }
        }
    }

    private handleSend () {
        if (/\S/.test(this.state.message) && this.state.message.length > 0) {
            console.log(this.state.message);
            const payload = {
                message: { 'hash': randomString(8), 'text': this.state.message.trim() },
                type: MESSAGE_TYPES.text
            };
            this.props.sendMessage(payload);
            this.setState({ message: '' });
        }
    }


    private checkMessageContent = (message: any) => {
        const newMessage = message;
        if (checkIfStringContainsURLs(message)) {
            const words = message.split(/\s+/);
            for (const word of words) {
                if (checkIfStringIsURL(word)) {
                    return (
                        <Text style={{color: 'blue'}} onPress={() => Linking.openURL('http://')}>{newMessage}</Text>
                    );
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

    // @ts-ignore
    private handleImageClick (url: string) {
        const { message } = this.props;
        const content = message.item.get('content');
        return (
            <LightBox navigator={navigator}>
                <Image
                    style={{ height: 300 }}
                    source={{ uri: STATIC_DOMAIN_NAME + '/' + content.category + '/' + this.props.currentRoom.hash + '/' + url }}
                />
            </LightBox>
        );
    }

}

const styles = StyleSheet.create({
    containerFlat: {
        flex: 1
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        justifyContent: 'center'
    },
    item: {
        marginVertical: moderateScale(7, 2),
        flexDirection: 'row'
    },
    itemIn: {
        marginLeft: 20
    },
    itemOut: {
        alignSelf: 'flex-end',
        marginRight: 20
    },
    balloon: {
        maxWidth: moderateScale(250, 2),
        paddingHorizontal: moderateScale(10, 2),
        paddingTop: moderateScale(5, 2),
        paddingBottom: moderateScale(7, 2),
        borderRadius: 13,
    },
    containerAlignTop: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    arrowContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        flex: 1
    },
    arrowLeftContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-start'
    },

    arrowRightContainer: {
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },

    arrowLeft: {
        left: moderateScale(-6, 0.5),
    },

    arrowRight: {
        right: moderateScale(-6, 0.5),
    },

    header: {
        backgroundColor: "#2196F3",
    },
    send: {
        marginTop: 5,
        marginBottom: 5,
        marginLeft: 5,
        marginRight: 5,
        alignItems: 'center',
        backgroundColor: "#2196F3",
        fontWeight: 'bold',
        padding: 13,
        borderRadius: 360
    },
    footer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
    },
    input: {
        marginTop: 5,
        marginBottom: 10,
        backgroundColor: '#F5F5F8',
        borderColor: '#000',
        borderRadius: 360,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 18,
        flex: 1
    },
    icon: {
        backgroundColor: "#2196F3",
        position: 'absolute',
        color: '#fff',
        width: 54,
        height: 48
    },
    attach: {
        transform: [{ rotate: '45deg'}],
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        color: "#2196F3",
        padding: 16
    },
    contentContainerStyle: {
        justifyContent: 'flex-end',
    },
    scrollToBottomStyle: {
        opacity: 0.8
    }
});

export default connect((state: any) => ({
    user: ivcUserSelector(state).userId,
    myUserId: userIdSelector(state),
    currentRoom: currentRoomSelector(state),
    currentRoomApp: appSelector(state, currentRoomAppIdSelector(state)),
    roomMessages: currentRoomMessagesSelector(state),
    currentRoomAssigned: currentRoomAssignedSelector(state),
    currentRoomLastSeenMessage: currentRoomLastSeenMessageSelector(state),
    currentRoomUsers: currentRoomUsersMapSelector(state),
    currentRoomTypingUsers: currentRoomTypingUsersSelector(state),
    lightBoxUrl: lightBoxUrlSelector(state),
    auth: authSelector(state),
    dashboardUsers: dashboardUsersSelector(state)
}), {
    loadRoom,
    sendMessage,
    sendTypingSignal,
    updateLastSeenMessage,
    initRtcConnection,
    closeRtcConnection
})(ChatScreen);
