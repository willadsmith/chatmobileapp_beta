import React, { Component } from 'react';
import { Text } from 'react-native';
import { timeFormatter } from '../../../../utils/common';

class RoomListDate extends Component<any, any> {
    // @ts-ignore
    private updateTimeout: any;

    constructor (props: any) {
        super(props);
        this.state = {
            period: null
        };
    }

    public componentDidMount () {
        const { dateInSeconds } = this.props;
        if (dateInSeconds < 86400) {
            this.setState({
                period: dateInSeconds < 3600 ? 60 : 3600
            }, () => {
                this.setLocalTimeout();
            });
        }
    }

    public componentDidUpdate (prevProps: any) {
        if (prevProps.dateInSeconds !== this.props.dateInSeconds) {
            this.setLocalTimeout();
        }
    }

    public componentWillUnmount () {
        this.updateTimeout = null;
    }

    public render () {
        return (
            <Text>{timeFormatter(this.props.timestamp)}</Text>
        );
    }

    private setLocalTimeout = () => {
        const { period } = this.state;
        const seconds = Math.floor((Number(new Date()) - Number(new Date(this.props.timestamp))) / 1000);
        if (seconds < 86400) {
            const updateTime = period - (seconds % period);
            this.updateTimeout = setTimeout(() => {
                const timeOutSeconds = Math.floor((Number(new Date()) - Number(new Date(this.props.timestamp))) / 1000);
                this.setState({
                    period: timeOutSeconds < 3600 ? 60 : 3600
                }, () => {
                    this.setLocalTimeout();
                });
            }, updateTime * 1000);

        } else {
            this.updateTimeout = null;
            this.setState({
                period: null
            });
        }
    };
}

export default RoomListDate;
