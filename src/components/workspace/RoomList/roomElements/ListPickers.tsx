import React, { PureComponent, Fragment } from 'react';
import { addError } from '../../../../ducks/alerts';
import { randomString } from '../../../../utils/common';
import { RTC_STATUSES } from '../../../../ducks/workspace/workspace';
import { View } from 'react-native';

interface IListPicker {
    items: any;
    amounts?: number[];
    input: any;
    rtcStatus: string;
    isSearchEnabled: boolean;
    disabled: boolean;
}

class ListPicker extends PureComponent<IListPicker, any> {

    public render () {
        const { items } = this.props;
        return (
            <Fragment>
                {items.map((item: any, key: number) => (
                    <View key={key}>
                        {item.value === this.props.input.value.value && 'checked'}`}
                        <View>
                            {this.handleSelect.bind(this, item, key)}
                            {item.name}
                            { this.getAmount(key) }
                        </View>
                    </View>
                ))}
            </Fragment>
        );
    }

    public getAmount (key: number) {
        const { amounts } = this.props;
        if (amounts && amounts[key]) {
            return (<span className={'filter-amount'}>{' (' + amounts[key] + ')'}</span>);
        }
        return null;
    }

    public handleSelect (item: any, key: number, event: any) {
        event.preventDefault();
        const { input: { onChange }, rtcStatus } = this.props;
        if (rtcStatus !== RTC_STATUSES.none) {
            addError('Rtc is on, noone moves - ' + randomString(5), 'You cannot switch until the video session is over');
            this.setState({
                isMenuVisible: false,
                currentKey: key
            });
            return;
        }
        onChange(item);
    }
}

export default ListPicker;
