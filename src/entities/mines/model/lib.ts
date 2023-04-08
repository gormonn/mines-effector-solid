import {
    Coord,
    GameConfig,
    GameItemEnum,
    GameItems,
    ItemCoord,
    MinesCoord,
} from '../types';
import { Nullable } from 'shared/types';
import { createLogger } from 'vite';

export const isMine = (item?: GameItemEnum) => item == GameItemEnum.mine;
export const isEmptyItem = (item?: GameItemEnum) => item == GameItemEnum.empty;
export const isNumber = (item?: GameItemEnum) =>
    !isEmptyItem(item) && !isMine(item);

export const formatCoords = (x: number, y: number, gameConfig?: GameConfig) => {
    const result = [x, y].join('-');

    if (!gameConfig) return result;

    if (x < 0 || x > gameConfig.width || y < 0 || y > gameConfig.height) {
        return null;
    }

    return result;
};

export const parseCoords = (key: string): MinesCoord =>
    key.split('-').map((e) => Number(e)) as MinesCoord;

/*
m = currentPoint
lt | t | tr
lm | m | mr
lb | b | br

x , y|x, y|x, y
-1,-1|0,-1|+1,-1
-1, 0|0, 0|+1, 0
-1,+1|0,+1|+1,+1
*/

export enum PointEnum {
    start,
    lt,
    lm,
    lb,
    t,
    b,
    tr,
    mr,
    br,
}

export type GetBroCoordsNewProps = ItemCoord & {
    gameItems: GameItems;
    currentPoint?: PointEnum;
    gameConfig: GameConfig;
};

type GetBroCoordsProps<T = string> = {
    coord: T;
    gameItems?: GameItems;
    gameConfig?: GameConfig;
    filterFn?: (coord: Nullable<T>, itemType?: GameItemEnum) => boolean;
    emptyMode?: boolean;
};

// Допущение
// when !!gameConfig - this means that getBroCoords called programmatically from loop
// so if !gameConfig, then coord can't be null, because it was called from the clicking on the exists game item
export const getBroCoords = ({
    coord,
    gameItems,
    gameConfig,
    filterFn,
    emptyMode = false,
}: GetBroCoordsProps): string[] => {
    const [x, y] = parseCoords(coord);

    const lt = !emptyMode ? formatCoords(x - 1, y - 1, gameConfig) : null;
    const lm = formatCoords(x - 1, y, gameConfig);
    const lb = !emptyMode ? formatCoords(x - 1, y + 1, gameConfig) : null;

    const t = formatCoords(x, y - 1, gameConfig);
    const b = formatCoords(x, y + 1, gameConfig);

    const tr = !emptyMode ? formatCoords(x + 1, y - 1, gameConfig) : null;
    const mr = formatCoords(x + 1, y, gameConfig);
    const br = !emptyMode ? formatCoords(x + 1, y + 1, gameConfig) : null;

    const result = [lt, lm, lb, t, b, tr, mr, br];

    if (filterFn && gameItems) {
        const nextItem = gameItems.get(coord);
        return result.filter((v) => filterFn(v, nextItem)) as string[];
    } else if (emptyMode) {
        return result.filter((v) => v) as string[];
    }
    return result as string[];
};

const createFilterFn =
    (gameItems: GameItems): GetBroCoordsProps['filterFn'] =>
    (coord) =>
        coord ? isEmptyItem(gameItems.get(coord)) : false;

// const createFilterFn =
//     (gameItems: GameItems): GetBroCoordsProps['filterFn'] =>
//     (nextCoord, prevItem) => {
//         if (nextCoord && prevItem !== undefined) {
//             const item = gameItems.get(nextCoord);
//             // console.log(prevItem, 'nextItemType');
//             // console.log(item, 'currentItemType');
//             if (isEmptyItem(item)) return true;
//             if (isNumber(item)) return item !== prevItem;
//             // return isEmptyItem(item) || isNumber(item);
//         }
//         return false;
//     };

// это очень не эффективный способ
export const getEmptyBroCoords = ({
    coord,
    gameItems,
    gameConfig,
}: GetBroCoordsNewProps) => {
    const item = gameItems.get(coord);
    if (isNumber(item) || isMine(item)) {
        console.log('isNumber || isMine');
        return [];
    }

    const filterFn = createFilterFn(gameItems);

    let step = 1;
    let doIt = true;
    // let prevBros: string[] = [];
    let prevBros: string = '';
    let nextBros: string[] = [];
    let bros = new Set(getBroCoords({ coord, emptyMode: true }));

    while (doIt) {
        // const entries = step ? bros.entries() : bros.entries();
        for (const [coord] of bros.entries()) {
            nextBros = getBroCoords({
                coord,
                gameConfig,
                filterFn,
                gameItems,
            });

            bros = new Set([...bros, ...nextBros]);
        }

        // console.log(step, 'step');

        if (
            // nextBros.length === prevBros.length &&
            prevBros === nextBros[0]
            // nextBros.every((val, index) => val === prevBros[index])
        ) {
            doIt = false;
        } else {
            console.log(
                nextBros.length === prevBros.length,
                'nextBros.length === prevBros.length',
            );
            if (nextBros.length === prevBros.length) {
                console.log(nextBros, 'nextBros');
                console.log(prevBros, 'prevBros');
            }
            step++;
            prevBros = nextBros[0];
        }
        // if (i <= 5) {
        //     bros = new Set([...bros, ...nextBros]);
        //     i++;
        // } else {
        //     doIt = false;
        // }
        // if (nextBros.length > 0) {
        //     bros = new Set([...bros, ...nextBros]);
        // } else {
        //     doIt = false;
        // }
    }

    console.log(step, 'step');

    return bros;
    // return Array.from(bros);

    // const nextBros = bros.reduce((acc, coord) => {
    //     const next = getBroCoordsNew({
    //         coord,
    //         gameItems,
    //         gameConfig,
    //     });
    //     next.length > 0 && console.log(next, 'next');
    //     // const newSet = new Set([...acc, ...next]);
    //     // // acc.add([...next]);
    //     // return newSet;
    //
    //     return new Set<string>([...acc, ...next]);
    //     // return [...acc, ...next];
    // }, new Set<string>());
    // // }, []);

    // console.log(nextBros, 'nextBros');
    // // return nextBros;
    // return Array.from(nextBros);

    // const bros = (Object.keys(broCoords) as Array<keyof BroPoints>)
    //     .filter((key) => {
    //         const coord = broCoords[key];
    //         if (coord) {
    //             const item = gameItems.get(coord);
    //             return isEmptyItem(item) || isNumber(item);
    //         }
    //         return true;
    //     })
    //     .reduce((accum, key) => {
    //         return Object.assign(accum, { [key]: broCoords[key] });
    //     }, {});
    //
    // console.log(bros, 'bros');
    // const nextBros = (Object.keys(broCoords) as Array<keyof BroPoints>).map(
    //     (key) => {
    //         const coord = broCoords[key];
    //         if (coord) {
    //             return getBroCoordsNew({
    //                 coord,
    //                 gameItems,
    //                 currentPoint: PointEnum[key],
    //             });
    //         }
    //         return null;
    //     },
    // );

    //     .reduce((acc, key)=>{
    //     return []
    //     // return [...acc, ]
    // }, [])
    // console.log(nextBros, 'nextBros');
    //
    // return [];
    // return bros;
    // return Object.values(bros);
    // return nextBros;
};

// todo: подучить линейную алгебру, что бы написать алгоритм по-лучше
//  (т.к. есть кейс ооооочень больших игровых полей)

// todo: добавить сдвиг камеры к центру при успешном открытии
// todo: добавить анимацию взрывов всех мин на поле
// todo: добавить "поселения" со своей жизнью на пустые клетки
// todo: при взрывах - они погибают
// todo: при нахождении мин между "островками" - жители поселений начинают ходить друг к другу в гости
// todo: возможно стоит генерировать расположение мин "особым образом", что бы добиться этого
// todo: придумать механику с подрывом мин - где подрыв мины - это не конец игры.
// todo: обыграть появление "номерков" таким образом, чтобы это вписывалось в сеттинг игры
//  например, мы отправляем зонд, который примерно определяет сколько мин вокруг
// todo: зонды не бесконечны, для этого требуется наладить их производство при помощи поселений
// todo: нужна какая-то внутренняя экономика и дополнительные механики
// todo: возможно будут какие-то события, когда мы обнаруживаем новые минные поля
//  потому что кто-то из поселенцев случайно их нашел

type GetBroAreaCoordsProps = {
    coord: Coord;
    gameItems: GameItems;
};
export const getBroAreaCoords = ({
    coord,
    gameItems,
}: GetBroAreaCoordsProps) => {};

// todo: check it for what
export const getClosestBros = (props: ItemCoord) => {
    const bros = getBroCoords(props);

    console.log('bros', bros);
};
