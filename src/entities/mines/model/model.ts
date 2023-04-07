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
    GameItem,
    NumberItems,
} from '../types';
import {
    formatCoords,
    getBroCoords,
    isEmptyItem,
    isMine,
    isNumber,
} from './lib';
import { createLogger } from 'vite';

const emptyCoordSet: CoordsSet = new Set();
const emptyCoordMap: GameItems = new Map();

const newGame = createGate<GameConfig>();
// const newGame = createGate<GameConfig>('new-game', {
//     width: 10,
//     height: 10,
//     showAllMines: true
// });

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

const getBroGroupCoords = (coord: Coord, gameItems: GameItems): Coord[] => {
    // console.group('getBroGroupCoords')
    // console.log( 'coord',coord)
    const broCoords = getBroCoords({ coord });
    // console.log( 'broCoords', broCoords,)

    const emptyBros = broCoords.filter((coord) => {
        return gameItems.has(coord) && isEmptyItem(gameItems.get(coord)); // : false;
    });

    // console.log('emptyBros',emptyBros)
    // console.groupEnd()
    return emptyBros;
    // todo: create связные списки пустых
    // return getBroCoords({coord}).filter(coord => {
    //     const broItem = gameItems.get(coord);
    //     return broItem ? isEmptyItem(broItem) : false;
    // });
};

// const getAllBroCoords = (coord: Coord, gameItems: GameItems): Set<Coord> => {
//     const emptyBros = getBroGroupCoords(coord, gameItems);
//     // console.group('getAllBroCoords')
//     // console.log(emptyBros, 'emptyBros')
//     // console.groupEnd()
//     if (emptyBros.length) {
//         let newBros = new Set<Coord>();
//
//         for (let i = 0; i <= emptyBros.length; i++) {
//             const coord = emptyBros[i];
//             newBros = getAllBroCoords(coord, gameItems);
//         }
//
//         return new Set([...emptyBros, ...newBros]);
//     } else {
//         return new Set([...emptyBros]);
//     }
//     // return getBroGroupCoords(coord, gameItems).map(coord => getAllBroCoords(coord, gameItems))
// };

const getAllBroCoords = (coord: Coord, gameItems: GameItems): Set<Coord> => {
    const emptyBros = getBroGroupCoords(coord, gameItems);
    // console.group('getAllBroCoords')
    // console.log(emptyBros, 'emptyBros')
    // console.groupEnd()
    if (emptyBros.length) {
        let newBros = new Set<Coord>();

        for (let i = 0; i <= emptyBros.length; i++) {
            const coord = emptyBros[i];
            newBros = getAllBroCoords(coord, gameItems);
        }

        return new Set([...emptyBros, ...newBros]);
    } else {
        return new Set([...emptyBros]);
    }
    // return getBroGroupCoords(coord, gameItems).map(coord => getAllBroCoords(coord, gameItems))
};

// todo: move to lib
const openEmptyBroCoords = (
    coord: Coord,
    gameItems: GameItems,
    openedItems: CoordsSet,
): Set<string> => {
    const emptyBros = getBroGroupCoords(coord, gameItems);

    emptyBros.forEach((coord) => openedItems.add(coord));

    // todo: посмотреть потом, хуета какая-то
    const broSet = new Set([
        ...emptyBros.map((coord) =>
            openEmptyBroCoords(coord, gameItems, openedItems),
        ),
    ]);

    // return new Set([...openedItems, ...broSet])
    return openedItems;
};

sample({
    clock: openItem,
    source: {
        openedItems: $openedItems,
        gameItems: $gameItems,
    },
    // todo: add filter by empty or number
    // filter: ,
    fn: ({ openedItems, gameItems }, coord) => {
        // todo: add open bro coords

        const newSet = new Set(openedItems);
        newSet.add(coord);
        // const broSet = openEmptyBroCoords(coord, gameItems, openedItems)
        const broSet = getAllBroCoords(coord, gameItems);

        // return broSet
        console.log(broSet, 'broSet');

        return newSet;
        // return new Set([...broSet, ...newSet])
        // todo: check it:
        //  return new Set([...Array.from(openedItems), coord])
    },
    target: $openedItems,
});

// todo: задать количество мин
sample({
    clock: newGame.open,
    fn: ({ width, height }) => {
        const mines = new Set<string>();
        const gameItems: GameItems = new Map(emptyCoordMap);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let nx = x / width - 0.5,
                    ny = y / height - 0.5;

                // todo: вернуть, это что бы отработать bro coords
                // const val = noise(50 * nx, 50 * ny) > 0.5 ? GameItem.mine : GameItem.empty;
                const val = GameItem.empty;
                const coord = formatCoords(x, y);
                gameItems.set(coord, val);
                if (val) mines.add(coord);
            }
        }

        gameItems.forEach((gameItem, coord) => {
            if (!isMine(gameItem)) {
                const broCoords = getBroCoords({ coord });
                const minesAroundCount = broCoords.reduce(
                    (accum, broCoordKey) => {
                        const broItem = gameItems.get(broCoordKey);
                        return !!broItem && isMine(broItem)
                            ? accum + broItem
                            : accum;
                    },
                    0,
                ) as unknown as NumberItems | GameItem.empty;

                gameItems.set(coord, Math.abs(minesAroundCount));
            }
        });
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
