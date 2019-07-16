import { Record } from 'immutable';
import { APP_NAME } from '../configs/';
import { all, put, select, take } from 'redux-saga/effects';
import { dispatch } from '../store';
import { randomString } from '../utils/common';
export const moduleName = 'popups';
const prefix = `${APP_NAME}/${moduleName}`;

export const ADD_POPUP = `${prefix}/ADD_POPUP`;
export const REMOVE_POPUP = `${prefix}/REMOVE_POPUP`;
export const UPDATE_POPUPS = `${prefix}/UPDATE_POPUPS`;

export const ReducerRecord = Record({
    popups: [],
});


export default function reducer (state = new ReducerRecord(), action: any) {
    const { type, payload } = action;
    switch (type) {
        case ADD_POPUP:
            return state
                .set('popups', [...state.popups]);
        case UPDATE_POPUPS:
            return state
                .set('popups', payload);
        default:
            return state;
    }
}

export const popUpsSelector = (state: any) => state[moduleName].popups;

export function addPopUp (name: string, props: any = {}) {
    dispatch({
        type: ADD_POPUP,
        payload: {
            name,
            props,
            hash: randomString(5)
        }
    });
}

export function removePopUp (hash: string) {
    return {
        type: REMOVE_POPUP,
        payload: {
            hash
        }
    };
}

export const removePopupSaga = function* () {
    while (true) {
        const { payload: { hash }} = yield take(REMOVE_POPUP);
        const popups = yield select(popUpsSelector);
        const filteredPopups = popups.filter((popup: any) => {
            return popup.hash !== hash;
        });

        yield put({
            type: UPDATE_POPUPS,
            payload: filteredPopups
        });
    }
};


export const saga = function* () {
    yield all([
        removePopupSaga(),
    ]);
};
