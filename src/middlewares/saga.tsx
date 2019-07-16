import { all } from 'redux-saga/effects';
import { saga as authSaga } from '../ducks/auth';
import { saga as workspaceSaga } from '../ducks/workspace/workspace';
import { saga as roomsSaga } from '../ducks/workspace/rooms';
import { saga as roomCurrent} from '../ducks/workspace/roomCurrent';

export default function* rootSaga () {
    yield all([
        authSaga(),
        roomCurrent(),
        workspaceSaga(),
        roomsSaga()
    ]);
}
