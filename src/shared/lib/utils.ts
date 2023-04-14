import {
    Coord,
    GameConfig,
    GameItemEnum,
    Indexes,
    MinesCoord,
    Nullable,
} from 'shared/types';

export const isMine = (item?: GameItemEnum) => item == GameItemEnum.mine;
export const isEmptyItem = (item?: GameItemEnum) => item == GameItemEnum.empty;
export const isNumber = (item?: GameItemEnum) =>
    !isEmptyItem(item) && !isMine(item);

// function overload (перегрузка функции)
export function formatCoords(x: number, y: number): string;
export function formatCoords(
    x: number,
    y: number,
    gameConfig?: GameConfig,
): Nullable<string>;
export function formatCoords(
    x: number,
    y: number,
    gameConfig?: GameConfig,
): Nullable<string> {
    const result = [x, y].join('-');

    if (!gameConfig) return result;

    if (x < 0 || x > gameConfig.width || y < 0 || y > gameConfig.height) {
        return null;
    }

    return result;
}

export const parseCoords = (key: string): MinesCoord =>
    key.split('-').map((e) => Number(e)) as MinesCoord;

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