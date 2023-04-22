import { isNumber } from 'shared/lib';
import { GameItems } from 'shared/types';

export const getNumbersCount = (gameItems: GameItems) => {
    return [...gameItems].filter(([, gameItem]) => isNumber(gameItem)).length;
};
