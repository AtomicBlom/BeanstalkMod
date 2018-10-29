const ts = require("gulp-typescript");
const MinecraftModBuilder = require("minecraft-scripting-toolchain")

compileTypeScript = [() => ts({
    noImplicitAny: true,
    "types": [
        "mcscripting"
    ]
})];

const modBuilder = new MinecraftModBuilder("Beanstalk");
modBuilder.scriptTasks = compileTypeScript;

module.exports = modBuilder.configureEverythingForMe();