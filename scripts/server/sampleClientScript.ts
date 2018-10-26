var system = client.registerSystem<IVanillaSystem>(0, 0);

system.initialize = function() {
    client.log("Hi world");

    system.listenForEvent("minecraft:client_entered_world",
        (newPlayer) => {
            client.log(newPlayer);
        })
};

var currentTick = 0;

system.update = function() {
    ++currentTick;
};
