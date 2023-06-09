import { getForcedBros } from 'entities/game/lib/forced-bros';
import { getNumbersCount } from 'entities/game/lib/get-numbers-count';
import {
    checkCoordInIndex,
    formatCoords,
    isEmptyItem,
    isMine,
} from 'shared/lib/utils';
import {
    GameConfig,
    GameItemEnum,
    GameItems,
    Indexes,
    NumberItems,
} from 'shared/types';
import { getBroCoords } from './get-bro-coords';
import { getEmptyBroCoordsV1 } from './get-empty-bro-coords-v1';

const emptyCoordMap: GameItems = new Map();

export const createGameItems = (config: GameConfig) => {
    const {
        width,
        height,
        withoutMines,
        minesFn,
        minesPreset,
        indexing,
        forcedEmptyBros,
        forcedMinesBros,
        forcedOpen,
    } = config;
    const mines = new Set<string>(minesPreset || []);
    const gameItems: GameItems = new Map(emptyCoordMap);

    const forcedMines = getForcedBros(config, forcedMinesBros);
    const forcedEmpty = getForcedBros(config, forcedEmptyBros);

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const val = (() => {
                if (withoutMines) return GameItemEnum.empty;
                if (forcedMinesBros) {
                    const coord = formatCoords(x, y);
                    const isForcedMine = forcedMines.includes(coord);
                    if (isForcedMine) return GameItemEnum.mine;
                }

                if (forcedEmptyBros) {
                    const coord = formatCoords(x, y);
                    const isForcedEmpty = forcedEmpty.includes(coord);
                    if (isForcedEmpty) return GameItemEnum.empty;
                }

                if (minesFn)
                    return minesFn(x, y)
                        ? GameItemEnum.mine
                        : GameItemEnum.empty;

                if (minesPreset)
                    return mines.has(formatCoords(x, y))
                        ? GameItemEnum.mine
                        : GameItemEnum.empty;

                return GameItemEnum.empty;
            })();

            const coord = formatCoords(x, y);
            gameItems.set(coord, val);

            if (!minesPreset && val) mines.add(coord);
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

    let indexes: Indexes | null = null;
    if (indexing) {
        indexes = [];
        gameItems.forEach((gameItem, coord) => {
            if (isEmptyItem(gameItem) && indexes) {
                const isCoordAlreadyIndexed = checkCoordInIndex(coord, indexes);
                if (!isCoordAlreadyIndexed) {
                    const emptyBroCoords = getEmptyBroCoordsV1({
                        coord,
                        gameItems,
                        config,
                    });
                    indexes.push(new Set(emptyBroCoords));
                }
            }
        });
    }

    // todo: check it
    // todo: bug: indexes содержит значения с отрицательными координатами

    const numbersCount = getNumbersCount(gameItems);

    return { gameItems, mines, indexes, numbersCount };
};
