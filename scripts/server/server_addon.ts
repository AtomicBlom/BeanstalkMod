interface IPrototypeModSystem extends ISystem<IPrototypeModSystem> {
    notifyPlayer(this: IPrototypeModSystem, player: IEntityObject): void;
    checkSeedPlaced(this: IPrototypeModSystem): void;
    allEntitiesView: IView;
    players: IEntityObject[];
}

const serverSystem: IPrototypeModSystem = server.registerSystem<IPrototypeModSystem>(0, 0);


var captureData = true;

serverSystem.initialize = function() {
    serverSystem.registerComponent("prototype_mod:seed_age", <ISeedAgeComponent>{ tickCreated: 0 })

    serverSystem.listenForEvent("minecraft:entity_created",
        (eventData) => {
            if (isSeed(eventData.entity)) {
                const seedAge = serverSystem.createComponent<ISeedAgeComponent>(eventData.entity, "prototype_mod:seed_age");
                seedAge.tickCreated = currentTick;
                serverSystem.applyComponentChanges(seedAge);
            }
        }
    );

    serverSystem.listenForEvent("prototype_mod:notify_player",
        (eventData: IEntityObject) => {
            serverSystem.notifyPlayer(eventData)
        }
    )

    this.allEntitiesView = serverSystem.registerView();
    this.players = [];
};

var currentTick = 0;

serverSystem.update = function() {
    ++currentTick;

    if ((currentTick % 200) !== 0) return;

    this.checkSeedPlaced();
};

function isSeed(entity: IEntityObject) {
    return entity.__type__ === "item_entity" && entity.__identifier__ === "minecraft:pumpkin_seeds"
}

function distanceSq(posA: IPositionComponent, posB: IPositionComponent) {
    return ((posB.x - posA.x) * (posB.x - posA.x)) + 
           ((posB.y - posA.y) * (posB.y - posA.y)) +
           ((posB.z - posA.z) * (posB.z - posA.z))
}

serverSystem.notifyPlayer = function(player: IEntityObject) {
    this.players.push(player);
}

serverSystem.checkSeedPlaced = function() {
    const seeds = serverSystem.getEntitiesFromView(this.allEntitiesView)
                                  .filter(isSeed)
                                  .map(seedEntity => <Seed>{
                                      entity: seedEntity,
                                      position: this.getComponent<IPositionComponent>(seedEntity, "minecraft:position"),
                                      age: this.getComponent<ISeedAgeComponent>(seedEntity, "prototype_mod:seed_age")
                                  })
                                  .filter(seed => seed.age.tickCreated + 1000 <= currentTick);

    if (seeds.length === 0) return;

    for (const player of this.players) {
        const playerPosition = this.getComponent<IPositionComponent>(player, "minecraft:position");
        
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

interface ISeedAgeComponent {
    tickCreated: number;
}