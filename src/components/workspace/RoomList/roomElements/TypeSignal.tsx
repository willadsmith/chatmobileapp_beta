import React, { PureComponent } from 'react';
import { View } from 'react-native';
import Spinner from 'react-native-spinkit';

interface ITypeSignal {
    currentRoomApp: any;
    currentRoomId: string;
    roomHash: string;
    typingUsers: any[];
    sendMessage: (payload: any) => any;
    sendTypingSignal: (payload: any) => any;
    roomId: number;
    authToken: string;
    userId: number;
    currentRoomAssigned: boolean;
}

class TypeSignal extends PureComponent<ITypeSignal, any> {

    public lastTypingTime: Date = new Date(new Date().getTime() - 2000);

    public state = {
        spinner: false,
    };

    public constructor (props: any) {
        super(props);
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
    }



    public render () {

        const { typingUsers } = this.props;
        return(

            typingUsers.map((user: any, index: number) => {
                return (
                    <View key={user.get('id')} style={{ flexDirection: 'row' }}>
                        {typingUsers.length > 0 && (
                            <Spinner
                                color={'#444'}
                                size={36}
                                type={'ThreeBounce'}
                                visible={this.state.spinner}
                                style={{ left: 20 }}
                            />)}
                    </View>
                );
            }));
    }

    private handleTextareaChange (event: any) {
        if (event.target.value !== '\n') {
            this._sendTypingSignal();
            this.setState({
                message: event.target.value
            });
        }
    }

    private _sendTypingSignal () {
        if ((Number(new Date()) - Number(this.lastTypingTime)) > 2000) {
            console.log('ttt sendTypingSignal', this.props.sendTypingSignal);
            if (this.props.roomHash) {
                this.lastTypingTime = new Date();
                this.props.sendTypingSignal({ roomHash: this.props.roomHash });
            }
        }
    }

}
export default TypeSignal;
