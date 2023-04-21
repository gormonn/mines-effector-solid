import { getBroCoords } from 'entities/game/lib/get-bro-coords';
import { isMine } from 'shared/lib';
import { Coord, CoordsSet, GameConfig, GameItems } from 'shared/types';

type Props = {
    coord: string;
    config: GameConfig;
    gameItems: GameItems;
    openedItems: CoordsSet;
};
export const getFlaggedMines = ({
    coord,
    config,
    gameItems,
    openedItems,
}: Props) => {
    const broSet = getBroCoords({ coord, config });

    const mines = broSet.filter((coord) => {
        const item = gameItems.get(coord);
        return isMine(item);
    });
    const openedBros = broSet.filter((coord) => openedItems.has(coord));
    const notOpenedBros = broSet.filter((coord) => {
        return !openedItems.has(coord) && !mines.includes(coord);
    });

    return {
        mines: mines.length === 8 - openedBros.length ? mines : [],
        empty: mines.length > 0 ? notOpenedBros : [],
    };
};

// export const getFlaggedEmpty = ({
//     mines,
//     openedItems,
// }: Props & { mines: Coord[] }) => {
//     // const broSet = getBroCoords({ coord, config });
//     //
//     // const mines = broSet.filter((coord) => {
//     //     const item = gameItems.get(coord);
//     //     return isMine(item);
//     // });
//     const notOpenedBros = broSet.filter((coord) => !openedItems.has(coord));
//
//     return mines.length ? notOpenedBros : [];
// };
