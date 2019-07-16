import { applyMiddleware, createStore } from 'redux';
import createSagaMiddleware from 'redux-saga';

import rootSaga from '../middlewares/saga';
import reducer from '../reducer/index';

const sagaMiddleware = createSagaMiddleware();

const enhancer = applyMiddleware(sagaMiddleware);
const store = createStore(reducer, enhancer);

sagaMiddleware.run(rootSaga);

export default store;
export const dispatch = store.dispatch;
