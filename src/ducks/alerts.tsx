import { OrderedMap, Record } from 'immutable';
import { all, call, fork, put, select, takeEvery } from 'redux-saga/effects';
import { createSelector } from 'reselect';
import { arrToMap, delay, mapToArr } from '../utils/common';
import { APP_NAME } from '../configs/';
import { dispatch } from '../store';


/*
 Constants
*/
export const moduleName = 'alerts';
const prefix = `${APP_NAME}/${moduleName}`;

export const UPDATE_ALERTS = `${prefix}/UPDATE_ALERTS`;
export const ADD_ERROR = `${prefix}/ADD_ERROR`;
export const ADD_SUCCESS = `${prefix}/ADD_SUCCESS`;



/*
 Reducer
*/
export const alertRecord = Record({
    id: null,
    type: null,
    message: null
});

export const ReducerRecord = Record({
    alerts: OrderedMap({})
});

export default function reducer (state = new ReducerRecord(), action: any) {
    const { type, payload } = action;

    switch (type) {
        case UPDATE_ALERTS:
            return state
                .set('alerts', payload.alerts);
        default:
            return state;
    }

}



/*
 Selectors
*/
export const stateSelector = (state: any) => state[moduleName];

export const alertsSelector = createSelector(
    stateSelector,
    (state) => {
        return mapToArr(state.alerts);
    }
);


/*
 * Action Creators
*/
export function addError (action: string, message: any) {
    dispatch({
        type: ADD_ERROR,
        payload: {
            action,
            message
        }
    });
}

/*
 Sagas
*/
export const addErrorSaga = function* (action: any) {

    const { payload } = action;

    let alertsArr = yield select(alertsSelector);
    alertsArr.push({
        id: payload.action,
        type: 'danger',
        message: payload.message
    });
    yield put({
        type: UPDATE_ALERTS,
        payload: {
            alerts: arrToMap(alertsArr, alertRecord)
        }
    });

    yield call(delay, 10000);

    alertsArr = yield select(alertsSelector);
    alertsArr = alertsArr.filter((item: any) => item.get('id') !== payload.action);
    yield put({
        type: UPDATE_ALERTS,
        payload: {
            alerts: arrToMap(alertsArr, alertRecord)
        }
    });

};

export const addSuccessSaga = function* (action: any) {
    const { payload } = action;

    let alertsArr = yield select(alertsSelector);
    alertsArr.push({
        id: payload.action,
        type: 'success',
        message: payload.message
    });
    yield put({
        type: UPDATE_ALERTS,
        payload: {
            alerts: arrToMap(alertsArr, alertRecord)
        }
    });

    yield call(delay, 10000);

    alertsArr = yield select(alertsSelector);
    alertsArr = alertsArr.filter((item: any) => item.get('id') !== payload.action);
    yield put({
        type: UPDATE_ALERTS,
        payload: {
            alerts: arrToMap(alertsArr, alertRecord)
        }
    });
};


function* alertsWatcher () {
    yield takeEvery(ADD_SUCCESS, addSuccessSaga);
    yield takeEvery(ADD_ERROR, addErrorSaga);
}


export const saga = function* () {
    yield all([
        fork(alertsWatcher)
    ]);
};
