import { isNumber } from 'shared/lib';
import { CoordsSet, GameItems } from 'shared/types';

export const getNumbers = (coords: CoordsSet, gameItems: GameItems) => {
    return [...coords].filter((coord) => {
        const item = gameItems.get(coord);
        return isNumber(item);
    });
};
