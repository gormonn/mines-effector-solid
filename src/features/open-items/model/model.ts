import { condition, reset, spread } from 'patronum';
import { combine, createEvent, createStore, sample } from 'effector';
import { gameModel } from 'entities/game';
import { getFlaggedMines } from 'entities/game/lib/get-flagged-mines';
import { isEmptyItem, isNumber } from 'shared/lib';
import type { Coord, CoordsSet } from 'shared/types';
import { MouseControls } from 'shared/types';
import { getNumbers } from './lib/get-numbers';

type ClickItemProps = { coord: Coord; button: MouseControls };
const emptyCoordSet: CoordsSet = new Set();
const clickItem = createEvent<ClickItemProps>();
const clickLMB = createEvent<ClickItemProps>();
const clickRMB = createEvent<ClickItemProps>();
// todo: add flag

// todo: add count of mines
// todo: add count of numbers to get win (if all numbers is open)
const $openedItems = createStore<CoordsSet>(emptyCoordSet);
const $flaggedItems = createStore<CoordsSet>(emptyCoordSet);

const hintNumber = createEvent();
const hintMine = createEvent();
const hintEmpty = createEvent();
const $hintedNumbers = createStore<CoordsSet>(emptyCoordSet);
const $hintedMines = createStore<CoordsSet>(emptyCoordSet);
const $hintedEmpty = createStore<CoordsSet>(emptyCoordSet);

const $clickedMine = createStore<string>('');
const $isGameOver = createStore(false);
const $isTouched = createStore(false); // todo: нахера?

const $isWin = createStore(false);
// todo: is win

const $maxOpenedItems = createStore<number>(0);

// (calc-win-condition)
sample({
    source: gameModel.$indexes,
    fn: (indexes) =>
        indexes?.reduce((acc, set) => {
            acc += set.size;
            return acc;
        }, 0) || 0,
    target: $maxOpenedItems,
});

// (win-game)
sample({
    source: { maxOpenedItems: $maxOpenedItems, openedItems: $openedItems },
    fn: ({ maxOpenedItems, openedItems }) =>
        openedItems.size === maxOpenedItems,
    target: $isWin,
});

// (show-hint-numbers)
sample({
    clock: hintNumber,
    source: { openedItems: $openedItems, gameItems: gameModel.$gameItems },
    filter: ({ openedItems }) => openedItems.size > 0,
    fn: ({ openedItems, gameItems }) => {
        const numbers = getNumbers(openedItems, gameItems);
        return new Set(numbers);
    },
    target: $hintedNumbers,
});

// (show-hint-empty)
sample({
    clock: hintEmpty,
    source: { openedItems: $openedItems, gameItems: gameModel.$gameItems },
    filter: ({ openedItems }) => openedItems.size > 0,
    fn: ({ openedItems, gameItems }) => {
        const numbers = getNumbers(openedItems, gameItems);
        return new Set(numbers);
    },
    target: $hintedEmpty,
});

// (call-next-endless-game)
sample({
    source: {
        clickedMine: $clickedMine,
        config: gameModel.$config,
    },
    filter: ({ config, clickedMine }) =>
        Boolean(config?.infinityMode && clickedMine.length > 0),
    fn: ({ clickedMine }) => {
        return {
            forcedEmptyBros: [clickedMine],
            forcedOpen: clickedMine,
        };
    },
    target: gameModel.genNewGame,
});

// (game-over)
sample({
    source: {
        clickedMine: $clickedMine,
        config: gameModel.$config,
    },
    filter: ({ config, clickedMine }) =>
        Boolean(config?.infinityMode === false && clickedMine.length > 0),
    fn: () => true,
    target: $isGameOver,
});

// (restart-game, next-endless-game)
reset({
    clock: [gameModel.newGame.close, gameModel.$config],
    target: [
        $flaggedItems,
        $openedItems,
        $isGameOver,
        $clickedMine,
        $hintedNumbers,
        $hintedMines,
        $hintedEmpty,
    ],
});

// (programmatically-open-handler)
sample({
    source: {
        config: gameModel.$config,
        indexes: gameModel.$indexes,
        gameItems: gameModel.$gameItems,
    },
    filter: ({ indexes, config }) =>
        Boolean(indexes) && Boolean(config?.forcedOpen),
    fn: ({ config, gameItems, indexes }) => {
        if (config?.forcedOpen) {
            const coord = config.forcedOpen;
            // todo#212312: move to lib
            const item = gameItems.get(coord);
            const broSet = isEmptyItem(item)
                ? indexes?.find((set) => set.has(coord)) || []
                : [];
            return new Set([...broSet, coord]);
        }
        return emptyCoordSet;
    },
    target: $openedItems,
});

// (click-on-mine)
sample({
    source: {
        mineItems: gameModel.$mineItems,
        openedItems: $openedItems,
    },
    // some opened, and game with mines
    filter: ({ mineItems, openedItems }) =>
        Boolean(mineItems.size > 0 && openedItems.size > 0),
    fn: ({ mineItems, openedItems }) =>
        Array.from(openedItems).find((openedItem) =>
            mineItems.has(openedItem),
        ) || '',
    target: $clickedMine,
});

// (click-on-item)
condition({
    source: clickItem,
    if: ({ button }) => button === MouseControls.Left,
    then: clickLMB,
    else: clickRMB,
});

// (flag-item) right mouse click on not opened item
sample({
    clock: clickRMB,
    source: { flaggedItems: $flaggedItems, openedItems: $openedItems },
    // isNotOpened
    filter: ({ openedItems }, { coord }) => !openedItems.has(coord),
    fn: ({ flaggedItems }, { coord }) => {
        const newSet = new Set(flaggedItems);
        if (newSet.has(coord)) {
            newSet.delete(coord);
        } else {
            newSet.add(coord);
        }
        return newSet;
    },
    target: $flaggedItems,
});

// (open-item) left mouse click on not opened item
sample({
    clock: clickLMB,
    source: {
        openedItems: $openedItems,
        gameItems: gameModel.$gameItems,
        indexes: gameModel.$indexes,
    },
    // isNotOpened
    filter: ({ openedItems }, { coord }) => !openedItems.has(coord),
    fn: ({ gameItems, openedItems, indexes }, { coord }) => {
        // todo#212312: move to lib
        const item = gameItems.get(coord);
        const broSet = isEmptyItem(item)
            ? indexes?.find((set) => set.has(coord)) || []
            : [];
        return new Set([...openedItems, ...broSet, coord]);
    },
    target: $openedItems,
});

// (open-item-on-click-number)
sample({
    clock: clickLMB,
    source: {
        openedItems: $openedItems,
        gameItems: gameModel.$gameItems,
        config: gameModel.$config,
        flaggedItems: $flaggedItems,
        indexes: gameModel.$indexes,
    },
    // is opened && is number
    filter: ({ openedItems, gameItems, config }, { coord }) => {
        const item = gameItems.get(coord);
        return isNumber(item) && openedItems.has(coord) && config !== null;
    },
    fn: (
        { gameItems, openedItems, config, flaggedItems, indexes },
        { coord },
    ) => {
        if (config && indexes) {
            const { mines, empty } = getFlaggedMines({
                coord,
                config,
                gameItems,
                openedItems,
                indexes,
                flaggedItems,
            });
            return {
                flaggedItems: new Set([...flaggedItems, ...mines]),
                openedItems: new Set([...openedItems, ...empty]),
            };
        }
        return { flaggedItems, openedItems };
    },
    target: spread({
        targets: { flaggedItems: $flaggedItems, openedItems: $openedItems },
    }),
});

// (set-touched)
sample({
    clock: [clickItem],
    fn: () => true,
    target: $isTouched,
});

export const model = {
    clickItem,
    $openedItems,
    $flaggedItems,
    $clickedMine,
    $isGameOver,
    $isTouched,
    hintNumber,
    hintMine,
    hintEmpty,
    $hintedNumbers,
    $hintedMines,
    $hintedEmpty,
    $isWin,
    $maxOpenedItems,
};
