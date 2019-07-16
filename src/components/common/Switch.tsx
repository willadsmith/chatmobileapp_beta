import React, { Component } from 'react';
import { Switch, Platform } from 'react-native';
import { primary, primaryWithOpacity } from '../../assets/app.style';

interface ICustomSwitch {
    value?: any;
    trackColor?: any;
    onValueChange?: any;
}
class CustomSwitch extends Component<ICustomSwitch, any> {
    constructor (props: any) {
        super(props);
        this.state = {
            pushStatus: false
        };
    }

    public render () {
        const { pushStatus } = this.state;
        let localProps = {};

        if (Platform.OS === 'android') {
            localProps = {
                thumbColor: pushStatus ? primary : '#FFF'
            };
        }

        return (
            <Switch
                value={this.state.pushStatus}
                trackColor={{ true: Platform.OS === 'ios' ? primary : primaryWithOpacity, false: '#E3E3E3' }}
                onValueChange={() => {
                    this.setState({
                        pushStatus: !this.state.pushStatus
                    });
                }}
                {...this.props}
                {...localProps}
            />
        );
    }
}
export default CustomSwitch;
