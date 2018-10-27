var clientSystem = client.registerSystem<IVanillaSystem>(0, 0);

clientSystem.initialize = function() {
    client.log("Hi world");

    clientSystem.listenForEvent("minecraft:client_entered_world",
        (newPlayer) => {
            clientSystem.broadcastEvent("prototype_mod:notify_player", newPlayer)
        }
    );
};

var currentTick = 0;

clientSystem.update = function() {
    ++currentTick;
};
