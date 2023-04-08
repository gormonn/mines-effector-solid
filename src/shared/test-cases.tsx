import {
    GameConfig,
    GameItemEnum,
    GameItems,
    NumberItems,
} from 'entities/mines/types';
import { noise } from 'shared/noise';
import { formatCoords, getBroCoords, isMine } from 'entities/mines/model/lib';

const emptyCoordMap: GameItems = new Map();

// todo: add logic minesPreset
export const createGameItems = (
    config: GameConfig,
): { gameItems: GameItems; mines: Set<string> } => {
    const { width, height, withoutMines, minesFn, minesPreset } = config;
    const mines = new Set<string>();
    const gameItems: GameItems = new Map(emptyCoordMap);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const val = (() => {
                if (withoutMines) return GameItemEnum.empty;
                return minesFn(x, y) ? GameItemEnum.mine : GameItemEnum.empty;
            })();
            const coord = formatCoords(x, y) as string;
            gameItems.set(coord, val);
            if (val) mines.add(coord);
        }
    }

    gameItems.forEach((gameItem, coord) => {
        if (!isMine(gameItem)) {
            const broCoords = getBroCoords({ coord });
            const minesAroundCount = broCoords.reduce((accum, broCoordKey) => {
                const broItem = gameItems.get(broCoordKey);
                return !!broItem && isMine(broItem) ? accum + broItem : accum;
            }, 0) as unknown as NumberItems | GameItemEnum.empty;

            gameItems.set(coord, Math.abs(minesAroundCount));
        }
    });

    return { gameItems, mines };
};

export const random = (size = 10): GameConfig => ({
    width: size,
    height: size,
    withoutMines: false,
    minesFn: (x, y) => {
        let nx = x / size - 0.5,
            ny = y / size - 0.5;
        return noise(50 * nx, 50 * ny) > 0.5;
    },
});

export const testDiagonalEmpty = (size: 10) => ({
    width: size,
    height: size,
    withoutMines: false,
    minesPreset: new Set<string>(['1-1']),
});

export const diagonal: GameConfig = {
    width: 4,
    height: 4,
    withoutMines: false,
    minesFn: (x, y) => x == y,
};

export const vert: GameConfig = ((size = 10): GameConfig => ({
    width: size,
    height: size,
    withoutMines: false,
    minesFn: (x) => x == 5,
}))();

export const horiz: GameConfig = ((size = 10): GameConfig => ({
    width: size,
    height: size,
    withoutMines: false,
    minesFn: (x, y) => y == 5,
}))();

export const vertHoriz: GameConfig = ((size = 10): GameConfig => ({
    width: size,
    height: size,
    withoutMines: false,
    minesFn: (x, y) => x == 5 || y == 5,
}))();
