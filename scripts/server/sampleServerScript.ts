var system = server.registerSystem<IVanillaSystem>(0, 0);

system.initialize = function() {
    system.listenForEvent("minecraft:entity_created",
        (newEntity) => {
            server.log(newEntity);
        });
    };

var currentTick = 0;

system.update = function() {
    ++currentTick;
};
