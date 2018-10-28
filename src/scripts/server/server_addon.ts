import { BeanstalkComponents, BeanstalkEvents, ISeedAgeComponent } from "../common";

namespace Server {
    interface IPrototypeModSystem extends IServerSystem<IPrototypeModSystem> {
        checkSeedPlaced(this: IPrototypeModSystem): void;
        allEntitiesView: IView;
        players: IEntityObject[];
    }

    const system: IPrototypeModSystem = server.registerSystem<IPrototypeModSystem>(0, 0);

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

        this.allEntitiesView = system.registerView();
        system.addFilterToView(BeanstalkComponents.SeedAge);
        this.players = [];
    };

    var currentTick = 0;

    system.update = function() {
        ++currentTick;

        if ((currentTick % 200) !== 0) return;

        this.checkSeedPlaced();
    };

    function isSeed(entity: IEntityObject) {
        return entity.__type__ === EntityType.ItemEntity && entity.__identifier__ === "minecraft:pumpkin_seeds"
    }

    function notifyPlayer(player: IEntityObject) {
        system.players.push(player);
    }

    system.checkSeedPlaced = function() {
        const allEntities = system.getEntitiesFromView(this.allEntitiesView);
        const seeds = allEntities
                                    .filter(isSeed)
                                    .map(seedEntity => <Seed>{
                                        entity: seedEntity,
                                        position: this.getComponent(seedEntity, MinecraftComponent.Position),
                                        age: this.getComponent<ISeedAgeComponent>(seedEntity, BeanstalkComponents.SeedAge)
                                    })
                                    .filter(seed => seed.age.tickCreated + 1000 <= currentTick);

        if (seeds.length === 0) return;

        for (const player of this.players) {
            const playerRotation = this.getComponent(player, MinecraftComponent.Rotation);
            

            const playerPosition = this.getComponent(player, MinecraftComponent.Position);
            
            server.log(`${playerPosition.x}, ${playerPosition.y}, ${playerPosition.z}`);

            for (const seed of seeds) {
                if (distanceSq(playerPosition, seed.position) < 25) {
                    this.broadcastEvent("minecraft:execute_command", `/fill ${seed.position.x} ${seed.position.y} ${seed.position.z} ${seed.position.x} ${seed.position.y} ${seed.position.z} grass`);
                    this.destroyEntity(seed.entity);
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