import { combineReducers } from 'redux';
import authReducer, { moduleName as authModule } from '../ducks/auth';
import workspaceReducer, { moduleName as workspaceModule } from '../ducks/workspace/workspace';
import roomsReducer, { moduleName as roomsModule } from '../ducks/workspace/rooms';
import { reducer as form } from 'redux-form';

export default combineReducers({
    [authModule]: authReducer,
    [workspaceModule]: workspaceReducer,
    [roomsModule]: roomsReducer,
    form,

});

