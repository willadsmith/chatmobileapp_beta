const blacklist = require('metro-config/src/defaults/blacklist');

module.exports = {
    getTransformModulePath () {
        return require.resolve('react-native-typescript-transformer');
    },
    getSourceExts () {
        return ['ts', 'tsx', 'js'];
    },
    getBlacklistRE () {
        return blacklist([/react-native\/local-cli\/core\/__fixtures__.*/]);
    },
};
