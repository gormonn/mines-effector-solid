import {
    Coord,
    GameConfig,
    GameItem,
    GameItems,
    ItemCoord,
    MinesCoord,
} from '../types';

export const isMine = (item?: GameItem) => item == GameItem.mine;
export const isEmptyItem = (item?: GameItem) => item == GameItem.empty;
export const isNumber = (item?: GameItem) =>
    !isEmptyItem(item) && !isMine(item);

export const formatCoords = (...coord: MinesCoord) => coord.join('-');

export const getCoordsKey = (key: string): MinesCoord =>
    key.split('-').map((e) => Number(e)) as MinesCoord;

/*
m = currentPoint
lt | t | tr
lm | m | mr
lb | b | br

x , y|x, y|x, y
-1,-1|0,-1|+1,-1
-1, 0|0, 0|+1, 0
-1,+1|0,+1|+1,+1
*/
enum Point {
    start,
    lt,
    lm,
    lb,
    t,
    b,
    tr,
    mr,
    br,
}
type BroPoints = string[];
export const getBroCoords = ({
    coord,
    currentPoint = Point.start,
}: ItemCoord & { currentPoint: Point }): BroPoints => {
    const [x, y] = getCoordsKey(coord);

    const lt = formatCoords(x - 1, y - 1);
    const lm = formatCoords(x - 1, y);
    const lb = formatCoords(x - 1, y + 1);

    const t = formatCoords(x, y - 1);
    const b = formatCoords(x, y + 1);

    const tr = formatCoords(x + 1, y - 1);
    const mr = formatCoords(x + 1, y);
    const br = formatCoords(x + 1, y + 1);

    switch (currentPoint) {
        case Point.lt:
            return [lt, lm, lb, t, tr];
        case Point.lm:
            return [lt, lm, lb];
        case Point.lb:
            return [lt, lm, lb, b, br];
        case Point.t:
            return [lt, t, tr];
        case Point.b:
            return [lb, b, br];
        case Point.tr:
            return [lt, t, tr, mr, br];
        case Point.mr:
            return [t, b, tr, mr, br];
        case Point.br:
            return [lb, b, tr, mr, br];
        default:
        case Point.start:
            return [lt, lm, lb, t, b, tr, mr, br];
    }
};

type GetBroAreaCoordsProps = {
    coord: Coord;
    gameItems: GameItems;
};
export const getBroAreaCoords = ({
    coord,
    gameItems,
}: GetBroAreaCoordsProps) => {};

// todo: check it for what
export const getClosestBros = (props: ItemCoord) => {
    const bros = getBroCoords(props);

    console.log('bros', bros);
};
