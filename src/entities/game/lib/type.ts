import {
    Coord,
    GameConfig,
    GameItemEnum,
    GameItems,
    ItemCoord,
    Nullable,
} from 'shared/types';

enum PointEnum {
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

export type GetBroCoordsNewProps = ItemCoord & {
    gameItems: GameItems;
    currentPoint?: PointEnum;
    config: GameConfig;
};
export type GetBroCoordsProps<T = string> = {
    coord: T;
    gameItems?: GameItems;
    config?: GameConfig;
    filterFn?: (coord: Nullable<T>, itemType?: GameItemEnum) => boolean;
    diagonal?: boolean;
};
export type GetBroAreaCoordsProps = {
    coord: Coord;
    gameItems: GameItems;
};
