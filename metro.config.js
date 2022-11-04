const exclusionList = require('metro-config/src/defaults/exclusionList');

const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
    ...config,
    resolver: {
        blacklistRE: exclusionList([/#current-cloud-backend\/.*/])
    }
};
