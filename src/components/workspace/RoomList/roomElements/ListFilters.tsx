import React, { PureComponent } from 'react';
import { Field, reduxForm } from 'redux-form';
import ListPicker from './ListPickers';


export const ROOM_TYPES = {
    'my': {
        value: 'my',
        name: 'My Chats'
    },
    'unassigned': {
        value: 'unassigned',
        name: 'New'
    }
};

interface IListFilters {
    roomsCounter: any;
    rtcStatus: string;
    change: any;
}

class ListFilters extends PureComponent<IListFilters, any> {

    public render () {
        const { roomsCounter, rtcStatus } = this.props;
        return (
            <div className="roomlist-wrapper-header-filters">
                <form>
                    <Field
                        name="roomType"
                        component={ListPicker}
                        items={[
                            ROOM_TYPES.my,
                            ROOM_TYPES.unassigned
                        ]}
                        amounts={[
                            roomsCounter.get('assigned'),
                            roomsCounter.get('notAssigned')
                        ]}
                        rtcStatus={rtcStatus}
                    />
                </form>

            </div>
        );
    }

}

export default reduxForm({
    form: 'roomsFilter',
    fields: ['roomType'],
    initialValues: {
        roomType: ROOM_TYPES.unassigned,
    }
})(ListFilters);
