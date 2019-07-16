import { call, put } from 'redux-saga/effects';
import { DASHBOARD } from '../configs';
import { FAIL, REFRESH, REFRESH_REQUEST, START, SUCCESS } from '../configs/types';
import { LOGOUT } from '../ducks/auth';


export const fetchDataFromServer = function* (action: any) {
    const { callApi, type, data = {}, headers = {}, ...rest }: any = action;

    yield put({ ...rest, type: type + START });

    const asyncCallFunc = (callApiPath: string, requestObject: any = {}, headersObject: any = {}) => {
        const formData = new FormData();
        for (const key in requestObject) {
            if (requestObject.hasOwnProperty(key)) {
                formData.append(
                    key,
                    typeof requestObject[key] === 'object' ?
                        JSON.stringify(requestObject[key]) :
                        (
                            requestObject[key] === null || requestObject[key] === undefined
                        ) ? '' : requestObject[key]
                );
            }
        }
        if (Object.keys(requestObject).length === 0) {
            formData.append('', '');
        }

        let isAnyHeaders = false;
        const headersData = new Headers();
        for (const key in headersObject) {
            console.log('ttt header fetchFromDataServer', headersObject);
            if (headersObject.hasOwnProperty(key)) {
                isAnyHeaders = true;
                headersData.append(
                    key,
                    typeof headersObject[key] === 'object' ?
                        JSON.stringify(headersObject[key]) :
                        (
                            headersObject[key] === null || headersObject[key] === undefined
                        ) ? '' : headersObject[key]
                );
            }
        }
        return fetch(callApiPath === 'https://static.ivcbox.com/files/upload:4430' ? callApiPath : DASHBOARD + callApiPath, {
            method: 'POST',
            body: formData,
            headers: headersData
        })
            .then(response => {
                const body = response.json();
                if ((response.status === 200 && response.status < 300) || isAnyHeaders === true) {
                    return body;
                } else {
                    return body.then(err => {
                        console.log('ttt err', err);
                        throw err;
                    });
                }
            }).catch((error: any) => {
                console.log('ttt error', error);
            });
    };

    try {
        const response = yield call(asyncCallFunc, callApi, data, headers);
        console.log('ttt response', callApi, response, data);
        if (response.status === false) {
            if (response.message === 'jwt expired') {
                if (type === REFRESH_REQUEST) {
                    yield put({ ...rest, type: LOGOUT });
                } else {
                    yield put({ ...rest, type: REFRESH, payload: { type, prevData: { data, callApi }}});
                }
            }
            else {
                yield put({ ...rest, type: type + FAIL, payload: response });
            }
        } else {
            yield put({ ...rest, type: type + SUCCESS, payload: response });
        }
        return response;
    } catch (errors) {
        // ЕСЛИ СТАТУС ОШИБКИ НЕ > 200 И < 300
        yield put({ ...rest, type: type + FAIL, payload: errors });
    }
    finally {
        // empty
    }
};
