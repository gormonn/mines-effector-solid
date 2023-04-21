import { isMine, isNumber } from 'shared/lib/utils';
import { GameItems } from 'shared/types';
import { getBroCoords } from './get-bro-coords';
import { GetBroCoordsNewProps, GetBroCoordsProps } from './type';

// todo: реализовать алгоритм через индексирование
//  - после генерации мин, мы должны найти пустые "острова" и записать их на "карту"
//  - при клике по ячейке, если это пустое поле, мы пытаемся найти данное поле в одном из "островов"
//   ... const islands = [Set<string>(), Set<string>(), Set<string>()];
//   ... const island = islands.find(set => set.has(coord))
//   ... return island
//  - и возвращаем уже просчитанный "остров"
//  плюсы:
//  - кажется весьма быстрым способом
//  -
//  минусы:
//  - дополнительная задержка при генерации карты
//  - таким образом будет сложно реализовать фичу "беспроигрышного первого хода"
//      - хотя можно пересмотреть создание игры таким образом,
//      чтобы генератор игры принимал первую открытую ячейку в качестве аргумента
//      в таком случае, все будет окей
//  - динамические механики игры будут провоцировать переиндексацию на каждое действие
//  -

// todo: подучить линейную алгебру, что бы написать алгоритм по-лучше
//  (т.к. есть кейс ооооочень больших игровых полей)

const createFilterFn =
    (gameItems: GameItems): GetBroCoordsProps['filterFn'] =>
    (coord) =>
        coord ? !isMine(gameItems.get(coord)) : false;

export const getEmptyBroCoordsV2 = ({
    coord,
    gameItems,
    config,
}: GetBroCoordsNewProps) => {
    const item = gameItems.get(coord);
    if (isNumber(item) || isMine(item)) return [];

    const filterFn = createFilterFn(gameItems);

    let step = 1;
    let doIt = true;
    let prevBros = '';
    let nextBros: string[] = [];
    let bros = new Set(getBroCoords({ coord, filterFn }));

    while (doIt) {
        for (const [coord] of bros.entries()) {
            if (!isNumber(gameItems.get(coord))) {
                nextBros = getBroCoords({
                    coord,
                    config,
                    filterFn,
                });

                bros = new Set([...bros, ...nextBros]);
            }
        }

        if (prevBros === JSON.stringify(nextBros)) {
            doIt = false;
        } else {
            step++;
            prevBros = JSON.stringify(nextBros);
        }
    }

    return bros;
};
