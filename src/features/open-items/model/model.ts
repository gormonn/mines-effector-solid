import { reset } from 'patronum';
import { createEvent, createStore, sample } from 'effector';
import { gameModel, getEmptyBroCoordsV1 } from 'entities/game';
import type { Coord, CoordsSet } from 'shared/types';

const emptyCoordSet: CoordsSet = new Set();

const openItem = createEvent<Coord>();
const openItemV2 = createEvent<Coord>();
// todo: add flag

// todo: add count of mines
// todo: add count of numbers to get win (if all numbers is open)
const $openedItems = createStore<CoordsSet>(emptyCoordSet);

const $clickedMine = createStore<string>('');
const $isGameOver = createStore<boolean>(false);

// todo: is win

reset({
    clock: gameModel.newGame.close,
    // clock: gameModel.newGame.status,
    target: [$openedItems, $isGameOver, $clickedMine],
});

sample({
    source: $clickedMine,
    fn: (clickedMine) => Boolean(clickedMine),
    // fn: (clickedMine) => !!clickedMine,
    // fn: Boolean,
    target: $isGameOver,
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
        gameConfig: gameModel.newGame.state,
    },
    // todo: add filter by empty or number
    filter: ({ openedItems }, coord) => !openedItems.has(coord),
    fn: ({ openedItems, gameItems, gameConfig }, coord) => {
        const broSet = getEmptyBroCoordsV1({ coord, gameItems, gameConfig });
        return new Set([...openedItems, ...broSet, coord]);
    },
    target: $openedItems,
});

sample({
    clock: openItemV2,
    source: {
        openedItems: $openedItems,
        indexes: gameModel.$indexes,
    },
    // todo: add filter by empty or number
    filter: ({ openedItems }, coord) => !openedItems.has(coord),
    fn: ({ openedItems, indexes }, coord) => {
        const broSet = indexes?.find((set) => set.has(coord)) || new Set([]);
        return new Set([...openedItems, ...broSet, coord]);
    },
    target: $openedItems,
});

export const model = {
    openItem,
    openItemV2,
    $openedItems,
    $clickedMine,
    $isGameOver,
};
