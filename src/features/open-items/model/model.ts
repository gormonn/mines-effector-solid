import { condition, reset, spread } from 'patronum';
import { createEvent, createStore, sample } from 'effector';
import { gameModel, getEmptyBroCoordsV1 } from 'entities/game';
import { getFlaggedMines } from 'entities/game/lib/get-flagged-mines';
import { isEmptyItem, isNumber } from 'shared/lib';
import type { Coord, CoordsSet } from 'shared/types';
import { MouseControls } from 'shared/types';

type ClickItemProps = { coord: Coord; button: MouseControls };
const emptyCoordSet: CoordsSet = new Set();
const openItem = createEvent<Coord>();
const clickItem = createEvent<ClickItemProps>();
const clickLMB = createEvent<ClickItemProps>();
const clickRMB = createEvent<ClickItemProps>();
// todo: add flag

// todo: add count of mines
// todo: add count of numbers to get win (if all numbers is open)
const $openedItems = createStore<CoordsSet>(emptyCoordSet);
const $flaggedItems = createStore<CoordsSet>(emptyCoordSet);

// todo: hint number
const hintNumber = createEvent();
// todo: hint mine
const hintMine = createEvent();
const $hintedNumbers = createStore<CoordsSet>(emptyCoordSet);
const $hintedMines = createStore<CoordsSet>(emptyCoordSet);

const $clickedMine = createStore<string>('');
const $isGameOver = createStore(false);
const $isTouched = createStore(false);
// todo: is win

sample({
    clock: hintNumber,
    fn: () => {
        return new Set([]);
    },
    target: $hintedNumbers,
});

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

reset({
    clock: [gameModel.newGame.close, gameModel.$config],
    target: [$openedItems, $isGameOver, $clickedMine],
});
// forcedOpen
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

sample({
    source: {
        mineItems: gameModel.$mineItems,
        openedItems: $openedItems,
    },
    filter: ({ mineItems, openedItems }) =>
        Boolean(mineItems.size > 0 && openedItems.size > 0),
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
        gameItems: gameModel.$gameItems,
        config: gameModel.newGame.state,
    },
    // todo: add filter by empty or number
    // is not opened
    filter: ({ openedItems }, coord) => !openedItems.has(coord),
    fn: ({ openedItems, gameItems, config }, coord) => {
        const broSet = getEmptyBroCoordsV1({ coord, gameItems, config });
        return new Set([...openedItems, ...broSet, coord]);
    },
    target: $openedItems,
});

condition({
    source: clickItem,
    if: ({ button }) => button === MouseControls.Left,
    then: clickLMB,
    else: clickRMB,
});

// const logFx = createEffect((props: { from: string } & ClickItemProps) => {
//     console.log(props, 'props');
// });
//
// sample({
//     clock: clickLMB,
//     fn: (props) => ({ ...props, from: 'LMB' }),
//     target: logFx,
// });
// sample({
//     clock: clickRMB,
//     fn: (props) => ({ ...props, from: 'RMB' }),
//     target: logFx,
// });

sample({
    clock: clickRMB,
    source: { flaggedItems: $flaggedItems, openedItems: $openedItems },
    // is not opened
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

sample({
    clock: clickLMB,
    source: {
        openedItems: $openedItems,
        gameItems: gameModel.$gameItems,
        indexes: gameModel.$indexes,
    },
    // is not opened
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

sample({
    clock: [openItem, clickItem],
    fn: () => true,
    target: $isTouched,
});

export const model = {
    openItem,
    clickItem,
    $openedItems,
    $flaggedItems,
    $clickedMine,
    $isGameOver,
    $isTouched,
    hintNumber,
    hintMine,
    $hintedNumbers,
    $hintedMines,
};
