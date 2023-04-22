import {
    Coord,
    GameConfig,
    GameItemEnum,
    Indexes,
    MinesCoord,
    Nullable,
    Shift,
} from 'shared/types';

export const isFlag = (item?: GameItemEnum) => item == GameItemEnum.flag;
export const isMine = (item?: GameItemEnum) => item == GameItemEnum.mine;
export const isEmptyItem = (item?: GameItemEnum) => item == GameItemEnum.empty;
export const isNumber = (item?: GameItemEnum) =>
    !isEmptyItem(item) && !isMine(item);

const defaultOffset: Shift = { x: 0, y: 0 };
// function overload (перегрузка функции)
export function formatCoords(x: number, y: number): string;
export function formatCoords(
    x: number,
    y: number,
    config?: GameConfig,
): Nullable<string>;
export function formatCoords(
    x: number,
    y: number,
    config?: GameConfig,
): Nullable<string> {
    const result = [x, y].join('-');

    if (!config) {
        if (x < 0 || y < 0) {
            return null;
        }
        return result;
    }

    if (x < 0 || x > config.width || y < 0 || y > config.height) {
        return null;
    }

    return result;
}

export const parseCoords = (key: string): MinesCoord => {
    // console.log(key, 'key');
    return key.split('-').map((e) => Number(e)) as MinesCoord;
};

// export const parseCoords = (key: string, offset = defaultOffset): MinesCoord =>
//     key.split('-').map((e, i) => {
//         if (i === 0) {
//             return Number(e) + offset.x;
//         }
//         return Number(e) + offset.y;
//     }) as MinesCoord;

export const checkCoordInIndex = (coord: Coord, indexes: Indexes) =>
    (indexes as Indexes).some((index) => index.has(coord));

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
