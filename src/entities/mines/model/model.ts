import {
    createDomain,
    createEvent,
    createStore,
    restore,
    sample,
} from 'effector';
import { createGate } from 'effector-solid';
import { condition, reset, spread } from 'patronum';
import { noise } from 'shared/noise';
import { Nullable } from 'shared/types';
import {
    GameConfig,
    GameItems,
    CoordsSet,
    Coord,
    GameItemEnum,
    NumberItems,
} from '../types';
import { formatCoords, getEmptyBroCoords, getBroCoords, isMine } from './lib';
import { createLogger } from 'vite';
import { createGameItems } from 'shared/test-cases';

const emptyCoordSet: CoordsSet = new Set();
const emptyCoordMap: GameItems = new Map();

const newGame = createGate<GameConfig>();

const openItem = createEvent<Coord>();
// todo: add flag

const $mineItems = createStore<CoordsSet>(emptyCoordSet);
// todo: add count of mines
// todo: add count of numbers to get win (if all numbers is open)
const $openedItems = createStore<CoordsSet>(emptyCoordSet);
const $gameItems = createStore<GameItems>(emptyCoordMap);

const $clickedMine = createStore<Coord>('');
const $isGameOver = createStore(false);

const $startTime = createStore<string>('');
const $endTime = createStore<string>('');

// todo: is win

reset({
    clock: newGame.close,
    // clock: newGame.status,
    target: [
        $mineItems,
        $gameItems,
        $openedItems,
        $isGameOver,
        $clickedMine,
        $startTime,
    ],
});

sample({
    source: $clickedMine,
    fn: (clickedMine) => Boolean(clickedMine),
    target: $isGameOver,
});

sample({
    source: {
        mineItems: $mineItems,
        openedItems: $openedItems,
    },
    filter: ({ mineItems, openedItems }) =>
        Boolean(mineItems.size && openedItems.size),
    fn: ({ mineItems, openedItems }) =>
        Array.from(openedItems).find((openedItem) =>
            mineItems.has(openedItem),
        ) || '',
    target: $clickedMine,
});

sample({
    clock: openItem,
    source: {
        openedItems: $openedItems,
        gameItems: $gameItems,
        gameConfig: newGame.state,
    },
    // todo: add filter by empty or number
    filter: ({ openedItems }, coord) => !openedItems.has(coord),
    fn: ({ openedItems, gameItems, gameConfig }, coord) => {
        const broSet = getEmptyBroCoords({ coord, gameItems, gameConfig });

        return new Set([...openedItems, ...broSet, coord]);
        // todo: check it:
        //  return new Set([...Array.from(openedItems), coord])
    },
    target: $openedItems,
});

// todo: задать количество мин
sample({
    clock: newGame.open,
    fn: (config) => {
        const { width, height, withoutMines } = config;

        const { mines, gameItems } = createGameItems(config);

        // const mines = new Set<string>();
        // const gameItems: GameItems = new Map(emptyCoordMap);
        //
        // for (let y = 0; y < height; y++) {
        //     for (let x = 0; x < width; x++) {
        //         const val = withoutMines
        //             ? GameItemEnum.empty
        //             : (() => {
        //                   let nx = x / width - 0.5,
        //                       ny = y / height - 0.5;
        //
        //                   // todo: вернуть, это что бы отработать bro coords
        //                   return noise(50 * nx, 50 * ny) > 0.5
        //                       ? GameItemEnum.mine
        //                       : GameItemEnum.empty;
        //               })();
        //         const coord = formatCoords(x, y) as string;
        //         gameItems.set(coord, val);
        //         if (val) mines.add(coord);
        //     }
        // }
        //
        // gameItems.forEach((gameItem, coord) => {
        //     if (!isMine(gameItem)) {
        //         const broCoords = getBroCoords({ coord });
        //         const minesAroundCount = broCoords.reduce(
        //             (accum, broCoordKey) => {
        //                 const broItem = gameItems.get(broCoordKey);
        //                 return !!broItem && isMine(broItem)
        //                     ? accum + broItem
        //                     : accum;
        //             },
        //             0,
        //         ) as unknown as NumberItems | GameItemEnum.empty;
        //
        //         gameItems.set(coord, Math.abs(minesAroundCount));
        //     }
        // });
        // todo: create связные списки (графы) с пустыми значениями

        return { gameItems, mines, startTime: new Date().toISOString() };
    },
    target: spread({
        targets: {
            mines: $mineItems,
            gameItems: $gameItems,
            startTime: $startTime,
        },
    }),
});

export const model = {
    newGame,
    openItem,
    $mineItems,
    $gameItems,
    $openedItems,
    $clickedMine,
    $isGameOver,
    $startTime,
};
