const ts = require("gulp-typescript");
const MinecraftModBuilder = require("./gulp/minecraftmodbuilder")

compileTypeScript = [ts({
    noImplicitAny: true,
    "types": [
        "mcscripting"
    ]
})];

const modBuilder = new MinecraftModBuilder("DeployTest");
modBuilder.scriptTasks = compileTypeScript;
modBuilder.configureEverythingForMe();