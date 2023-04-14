import { reset, spread } from 'patronum';
import { createStore, sample } from 'effector';
import { createGate } from 'effector-solid';
import {
    CoordsSet,
    GameConfig,
    GameItems,
    GameItemsV2,
    Indexes,
    Nullable,
} from 'shared/types';
import { createGameItems } from './lib/create-game-items';

const emptyCoordSet: CoordsSet = new Set();
const emptyCoordMap: GameItems = new Map();
const emptyCoordMapV2: GameItemsV2 = new Map();

const newGame = createGate<GameConfig>();

const $gameConfig = createStore<Nullable<GameConfig>>(null);
const $mineItems = createStore<CoordsSet>(emptyCoordSet);
const $indexes = createStore<Nullable<Indexes>>(null);
const $gameItems = createStore<GameItems>(emptyCoordMap);

// todo#: маппинг без форматирования и парсинга ключей
// todo: замерить "до и после"
const $gameItemsV2 = createStore<GameItemsV2>(emptyCoordMapV2);
const $debugMode = createStore(false);

const $startTime = createStore<string>('');
const $endTime = createStore<string>('');

// todo: задать количество мин
sample({
    clock: newGame.open,
    fn: (config) => {
        const { debugMode, perfMeter } = config;

        const perfLabel = perfMeter ? `start generation` : '';

        if (perfMeter) console.time(perfLabel);

        const { mines, gameItems, indexes } = createGameItems(config);
        // todo: create связные списки (графы) с пустыми значениями

        if (perfMeter) console.timeEnd(perfLabel);

        return {
            gameItems,
            mines,
            startTime: new Date().toISOString(),
            debugMode,
            config,
            indexes,
        };
    },
    target: spread({
        targets: {
            mines: $mineItems,
            gameItems: $gameItems,
            startTime: $startTime,
            debugMode: $debugMode,
            config: $gameConfig,
            indexes: $indexes,
        },
    }),
});

reset({
    clock: newGame.close,
    // clock: gameModel.newGame.status,
    target: [$mineItems, $gameItems, $startTime],
});

export const model = {
    newGame,
    $mineItems,
    $gameItems,
    $startTime,
    $endTime,
    $debugMode,
    $gameConfig,
    $gameItemsV2,
    $indexes,
};

// todo: add different shapes:
//  - прямоугольным треугольник с квадратным тайлингом - 14 мин вокруг (макс)
//  - равносторонний треугольник с гексагональным тайлингом - 12 мин вокруг (макс)
//  Статья про систему координат для треугольных тайлов:
//  https://nornagon.medium.com/til-triangle-grids-133ed47cc807
//  http://www-cs-students.stanford.edu/~amitp/game-programming/grids/
//  думаю в таком случае, нужно учитывать: x%2 и y%2
//  типа, если x % 2 == 1, то делаем сдвиг по y
