const ts = require("gulp-typescript");
const MinecraftModBuilder = require("minecraft-scripting-toolchain")

const modBuilder = new MinecraftModBuilder("Beanstalk");

compileTypeScript = () => ts({
    module: "ES6",
    noImplicitAny: true,
    types: [
        "minecraft-scripting-types"
    ]
});

modBuilder.scriptTasks = [compileTypeScript];

module.exports = modBuilder.configureEverythingForMe();