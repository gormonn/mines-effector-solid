import { createNoise2D } from 'simplex-noise';
import { GameConfig } from 'shared/types';

export const random = (size = 10): GameConfig => ({
    width: size,
    height: size,
    withoutMines: false,
    minesFn: (x, y) => {
        const noise = createNoise2D();
        const nx = x / size - 0.5,
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

export const diagonal2: GameConfig = {
    width: 6,
    height: 6,
    withoutMines: false,
    minesFn: (x, y) => (x == y && (x == 1 || x == 4)) || (x == 4 && y == 0),
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
