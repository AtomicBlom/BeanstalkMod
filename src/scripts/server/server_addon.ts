import { BeanstalkComponents, BeanstalkEvents, ISeedAgeComponent } from "../common";

namespace Server {
    const system = server.registerSystem(0, 0);
    const players: IEntityObject[] = [];
    let allEntitiesView: IView;

    system.initialize = function() {
        system.registerComponent(BeanstalkComponents.SeedAge, <ISeedAgeComponent>{ tickCreated: 0 })

        system.listenForEvent(MinecraftServerEvent.EntityCreated,
            (eventData) => {
                if (isSeed(eventData.entity)) {
                    const seedAge = system.createComponent<ISeedAgeComponent>(eventData.entity, BeanstalkComponents.SeedAge);
                    seedAge.tickCreated = currentTick;
                    system.applyComponentChanges(seedAge);  
                }
            }   
        ); 

        system.listenForEvent(BeanstalkEvents.NotifyPlayer,
            (eventData: IEntityObject) => {
                notifyPlayer(eventData)
            }
        )

        allEntitiesView = system.registerView();
        system.addFilterToView(BeanstalkComponents.SeedAge);
    };

    var currentTick = 0;

    system.update = function() {
        ++currentTick;

        if ((currentTick % 200) !== 0) return;

        checkSeedPlaced();
    };

    function isSeed(entity: IEntityObject) {
        return entity.__type__ === EntityType.ItemEntity && entity.__identifier__ === "minecraft:pumpkin_seeds"
    }

    function notifyPlayer(player: IEntityObject) {
        players.push(player);
    } 

    function checkSeedPlaced() {
        const allEntities = system.getEntitiesFromView(allEntitiesView);
        const seeds = allEntities
                                    .filter(isSeed)
                                    .map(seedEntity => <Seed>{
                                        entity: seedEntity,
                                        position: system.getComponent(seedEntity, MinecraftComponent.Position),
                                        age: system.getComponent<ISeedAgeComponent>(seedEntity, BeanstalkComponents.SeedAge)
                                    })
                                    .filter(seed => seed.age.tickCreated + 1000 <= currentTick);

        if (seeds.length === 0) return;
        
        for (const player of players) {
            const playerPosition = system.getComponent(player, MinecraftComponent.Position);
            
            server.log(`${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}`);

            for (const seed of seeds) {
                if (distanceSq(playerPosition, seed.position) < 25) {
                    system.broadcastEvent("minecraft:execute_command", `/fill ${seed.position.x} ${seed.position.y} ${seed.position.z} ${seed.position.x} ${seed.position.y} ${seed.position.z} grass`);
                    system.destroyEntity(seed.entity);
                }
            }
        } 
    }

    interface Seed {
        entity: IEntityObject;
        position: IPositionComponent;
        age: ISeedAgeComponent;
    }

    export function distanceSq(posA: IPositionComponent, posB: IPositionComponent) {
        return ((posB.x - posA.x) * (posB.x - posA.x)) +
            ((posB.y - posA.y) * (posB.y - posA.y)) +
            ((posB.z - posA.z) * (posB.z - posA.z))
    }
}