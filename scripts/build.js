const rewire = require("rewire");
const defaults = rewire("react-scripts/scripts/build.js");

let config = defaults.__get__("config");
config.output.filename = config.output.filename.replace(".[contenthash:8]", "");
config.output.chunkFilename = config.output.chunkFilename.replace(".[contenthash:8]", "");
config.output.assetModuleFilename = config.output.assetModuleFilename.replace(".[hash]", "");
config.plugins.forEach(plugin => {
    if (plugin.options) {
        if (plugin.options.filename) {
            plugin.options.filename = plugin.options.filename.replace(".[contenthash:8]", "");
        }
        if (plugin.options.chunkFilename) {
            plugin.options.chunkFilename = plugin.options.chunkFilename.replace(".[contenthash:8]", "");
        }
    }
});
