import { reset, spread } from 'patronum';
import {
    combine,
    createEffect,
    createEvent,
    createStore,
    sample,
} from 'effector';
import { createGate } from 'effector-solid';
import {
    CoordsSet,
    GameConfig,
    GameItems,
    GameItemsV2,
    Indexes,
    Nullable,
} from 'shared/types';
import { createGameItems } from '../lib/create-game-items';

const emptyCoordSet: CoordsSet = new Set();
const emptyCoordMap: GameItems = new Map();
const emptyCoordMapV2: GameItemsV2 = new Map();

const newGame = createGate<GameConfig>();

type Direction = -1 | 1;
const setShiftX = createEvent<Direction>();
const setShiftY = createEvent<Direction>();
const $shiftX = createStore<number>(0);
const $shiftY = createStore<number>(0);

const $shift = combine({ x: $shiftX, y: $shiftY }, (p) => p);

sample({
    clock: setShiftX,
    source: $shiftX,
    fn: (x, dir) => x + dir,
    target: $shiftX,
});

sample({
    clock: setShiftY,
    source: $shiftY,
    fn: (y, dir) => y + dir,
    target: $shiftY,
});

const $config = createStore<Nullable<GameConfig>>(null);
const $mineItems = createStore<CoordsSet>(emptyCoordSet);
const $indexes = createStore<Nullable<Indexes>>(null);
const $gameItems = createStore<GameItems>(emptyCoordMap);

// todo#: маппинг без форматирования и парсинга ключей
// todo: замерить "до и после"
const $gameItemsV2 = createStore<GameItemsV2>(emptyCoordMapV2);
const $debugMode = createStore(false);

const $startTime = createStore<string>('');
const $endTime = createStore<string>('');

const genNewGame = createEvent<Nullable<Partial<GameConfig>>>();

sample({
    clock: newGame.open,
    target: $config,
});

// необходимо для того, что-бы параметры не мигрировали с каждой "новой игрой"
// только не понятно нахуя
const usedOnce: Set<keyof GameConfig> = new Set([
    'infinityMode',
    'forcedEmptyBros',
    'forcedOpen',
]);
// todo: move to lib
const filterConfig = (config: GameConfig): Partial<GameConfig> =>
    Object.fromEntries(
        Object.entries(config).filter(
            ([key]) => !usedOnce.has(key as keyof GameConfig),
        ),
    );

// sample({
//     clock: genNewGame,
//     source: $config,
//     filter: Boolean,
//     fn: (config, newConfig) => {
//         const filteredConfig = filterConfig(config);
//         return (
//             newConfig
//                 ? { ...filteredConfig, ...newConfig }
//                 : { ...filteredConfig }
//         ) as GameConfig;
//     },
//     target: $config,
// });
// так как не понятно нахуя, сохранил предыдущий вариант, чтобы проверить потом
sample({
    clock: genNewGame,
    source: $config,
    filter: Boolean,
    fn: (config, newConfig) =>
        newConfig ? { ...config, ...newConfig } : { ...config },
    target: $config,
});

// todo: задать количество мин
sample({
    source: $config,
    filter: Boolean,
    fn: (config) => {
        const { debugMode, perfMeter } = config;

        const perfLabel = perfMeter ? `start generation` : '';

        if (perfMeter) console.time(perfLabel);

        const { mines, gameItems, indexes } = createGameItems(config);
        // todo: create связные списки (графы) с пустыми значениями

        if (perfMeter) console.timeEnd(perfLabel);

        return {
            startTime: new Date().toISOString(),
            gameItems,
            mines,
            debugMode,
            indexes,
        };
    },
    target: spread({
        targets: {
            mines: $mineItems,
            gameItems: $gameItems,
            startTime: $startTime,
            debugMode: $debugMode,
            indexes: $indexes,
        },
    }),
});

reset({
    clock: newGame.close,
    target: [$mineItems, $gameItems, $startTime],
});

// const logFx = createEffect((val) => {
//     console.log(val, 'val');
// });
//
// sample({ source: $startTime, target: logFx });

export const model = {
    newGame,
    $mineItems,
    $gameItems,
    $startTime,
    $endTime,
    $debugMode,
    $config,
    $gameItemsV2,
    $indexes,
    emptyCoordSet,
    emptyCoordMap,
    emptyCoordMapV2,

    $shiftX,
    $shiftY,
    $shift,
    setShiftX,
    setShiftY,

    genNewGame,
};

// todo: add different shapes:
//  - прямоугольным треугольник с квадратным тайлингом - 14 мин вокруг (макс)
//  - равносторонний треугольник с гексагональным тайлингом - 12 мин вокруг (макс)
//  Статья про систему координат для треугольных тайлов:
//  https://nornagon.medium.com/til-triangle-grids-133ed47cc807
//  http://www-cs-students.stanford.edu/~amitp/game-programming/grids/
//  думаю в таком случае, нужно учитывать: x%2 и y%2
//  типа, если x % 2 == 1, то делаем сдвиг по y
