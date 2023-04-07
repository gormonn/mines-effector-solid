export enum GameItem {
    mine = -1,
    empty = 0,
    n1 = 1,
    n2 = 2,
    n3 = 3,
    n4 = 4,
    n5 = 5,
    n6 = 6,
    n7 = 7,
    n8 = 8,
    n9 = 9
}

export type NumberItems =
    | GameItem.n1
    | GameItem.n2
    | GameItem.n3
    | GameItem.n4
    | GameItem.n5
    | GameItem.n6
    | GameItem.n7
    | GameItem.n8
    | GameItem.n9;

// export type GameItems = Record<Coord, GameItem>;
export type GameItems = Map<Coord, GameItem>;

export type MinesCoord = [number, number];
export type GameConfig = { width: number; height: number, showAllMines: boolean }
export type Coord = string;
export type ItemCoord = { coord: Coord };
export type CoordsSet = Set<Coord>
export type ItemOpener = (coord: Coord) => void;
export type WithItemOpener = { openItem: ItemOpener };