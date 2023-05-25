import { isNumber } from 'shared/lib';
import { CoordsSet, GameItems } from 'shared/types';

export const getNumbers2 = (coords: CoordsSet, gameItems: GameItems) => {
    console.log(coords, 'getNumbers2 coords');
    const res = [...coords].filter((coord) => {
        const item = gameItems.get(coord);
        return !isNumber(item);
    });
    console.log(gameItems, 'getNumbers2 gameItems');
    console.log(res, 'getNumbers2 res');
    return res;
};
export const getNumbers = (coords: CoordsSet, gameItems: GameItems) => {
    console.log(coords, 'getNumbers coords');
    const res = [...coords].filter((coord) => {
        const item = gameItems.get(coord);
        return !isNumber(item);
    });
    console.log(gameItems, 'getNumbers gameItems');
    console.log(res, 'getNumbers res');
    return res;
};
