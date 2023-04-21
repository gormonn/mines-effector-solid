export type Nullable<T> = T | null;

export enum GameItemEnum {
    flag = -2,
    mine = -1,
    empty = 0, //todo: не удобно, т.к. это falsy значение
    n1 = 1,
    n2 = 2,
    n3 = 3,
    n4 = 4,
    n5 = 5,
    n6 = 6,
    n7 = 7,
    n8 = 8,
    n9 = 9,
}

export type NumberItems =
    | GameItemEnum.n1
    | GameItemEnum.n2
    | GameItemEnum.n3
    | GameItemEnum.n4
    | GameItemEnum.n5
    | GameItemEnum.n6
    | GameItemEnum.n7
    | GameItemEnum.n8
    | GameItemEnum.n9;
// export type GameItems = Record<Coord, GameItemEnum>;
export type GameItems = Map<Coord, GameItemEnum>;
// todo#: маппинг без форматирования и парсинга ключей
export type GameItemsV2 = Map<[number, number], GameItemEnum>;
export type MinesCoord = [number, number];

export enum RenderType {
    dom,
    canvas,
}

export enum StoreVersion {
    v1,
    v2,
}

export type GameConfig = {
    width: number;
    height: number;
    showAllMines?: boolean;
    withoutMines?: boolean;
    minesPreset?: CoordsSet;
    minesFn?: (x: number, y: number) => boolean;
    debugMode?: boolean;
    perfMeter?: boolean;

    indexing?: boolean;
    render?: RenderType;
    storeVersion?: StoreVersion;

    shiftX?: number;
    shiftY?: number;

    forcedEmptyBros?: Coord[];
    forcedMinesBros?: Coord[];
    forcedOpen?: Coord;
    infinityMode?: boolean;
};
export type SerializableGameConfig = Partial<
    Omit<GameConfig, 'minesPreset'>
> & {
    minesPreset?: string[];
};
export type Coord = string;
export type ItemCoord = { coord: Coord };
export type CoordsSet = Set<Coord>;
export type ItemOpener = (coord: Coord) => void;
export type WithItemOpener = { openItem: ItemOpener };
export type Indexes = Array<CoordsSet>;

export type Shift = { x: number; y: number };

// todo: разные настройки управления
//  под комп мышь с 2 кнопками
//  под мобилу др
export enum MouseControls {
    Left,
    Mid,
    Right,
}
