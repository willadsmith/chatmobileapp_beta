import { Navigation } from 'react-native-navigation';
import store from '../store/index';
import { Provider } from 'react-redux';
import AuthScreen from '../components/auth/signIn/index';
import PasswordResetScreen from '../components/auth/passwordReset/index';
import WorkSpaceScreen from '../components/workspace';
import SettingsScreen from '../components/settings/index';
import ProfileScreen from '../components/settings/profile/index';
import RoomMy from '../components/workspace/RoomList/RoomMy';
import RoomNew from '../components/workspace/RoomList/RoomNew';
import PasswordChange from '../components/settings/passwordChange/index';
import ChatScreen from '../components/workspace/RoomList/chatscreen/chatscreen';
import App from '../App';
import { YellowBox } from 'react-native';

YellowBox.ignoreWarnings([
    'unknown call: "relay:check"',
    'Require cycle: node_modules/react-native/Libraries/Network/fetch.js -> node_modules/react-native/Libraries/vendor/core/whatwg-fetch.js -> node_modules/react-native/Libraries/Network/fetch.js',
    'Require cycle: node_modules/rn-fetch-blob/index.js -> node_modules/rn-fetch-blob/polyfill/index.js -> node_modules/rn-fetch-blob/polyfill/Blob.js -> node_modules/rn-fetch-blob/index.js',
    'Unrecognized WebSocket connection option(s) `agent`, `perMessageDeflate`, `pfx`, `key`, `passphrase`, `cert`, `ca`, `ciphers`, `rejectUnauthorized`. Did you mean to put these under `headers`?'
]);



export const registerScreens = () => {
    Navigation.registerComponentWithRedux('IvcBox.InitializeScreen', () => App, Provider, store);
    Navigation.registerComponentWithRedux(`IvcBox.AuthScreen`, () => AuthScreen, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.WorkSpaceScreen', () => WorkSpaceScreen, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.SettingsScreen', () => SettingsScreen, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.PasswordResetScreen', () => PasswordResetScreen, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.ProfileScreen', () => ProfileScreen, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.PasswordChangeScreen', () => PasswordChange, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.ChatScreen', () => ChatScreen, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.RoomMyScreen', () => RoomMy, Provider, store);
    Navigation.registerComponentWithRedux('IvcBox.RoomNewScreen', () => RoomNew, Provider, store);
};

