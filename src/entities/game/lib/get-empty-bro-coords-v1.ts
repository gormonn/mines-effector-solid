import { isMine, isNumber } from 'shared/lib/utils';
import { GameItems } from 'shared/types';
import { getBroCoords } from './get-bro-coords';
import { GetBroCoordsNewProps, GetBroCoordsProps } from './type';

// todo: реализовать бинарный алгоритм V2
//  бьем поле пополам
//  находим первый номер слева - запоминаем индекс1
//  находим первый номер справа - запоминаем индекс2
//  получаем точки между индекс1 и индекс2
//  повторяем наверх и вниз
//  - если от края есть пустота по диагонали - повторяем вверх и вниз от этой точки

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

// это не быстрый алгоритм. O(n^2) ?
export const getEmptyBroCoordsV1 = ({
    coord,
    gameItems,
    gameConfig,
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
                    gameConfig,
                    filterFn,
                });

                bros = new Set([...bros, ...nextBros]);
            }
        }

        if (prevBros === JSON.stringify(nextBros)) {
            doIt = false;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            step++;
            prevBros = JSON.stringify(nextBros);
        }
    }

    return bros;
};
