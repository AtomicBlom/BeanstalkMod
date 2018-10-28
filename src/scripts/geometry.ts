export function distanceSq(posA: IPositionComponent, posB: IPositionComponent) {
    return ((posB.x - posA.x) * (posB.x - posA.x)) +
        ((posB.y - posA.y) * (posB.y - posA.y)) +
        ((posB.z - posA.z) * (posB.z - posA.z))
}