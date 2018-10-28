import { BeanstalkEvents } from "../common";

namespace Client {
    var system = client.registerSystem(0, 0);

    system.initialize = function() {
        client.log("Hi world");

        system.listenForEvent("minecraft:client_entered_world",
            (newPlayer) => {
                system.broadcastEvent(BeanstalkEvents.NotifyPlayer, newPlayer)
            }
        );
    };

    var currentTick = 0;

    system.update = function() {
        ++currentTick;
    };
}