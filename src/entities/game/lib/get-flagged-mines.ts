import { getBroCoords } from 'entities/game/lib/get-bro-coords';
import { isEmptyItem, isMine } from 'shared/lib';
import { CoordsSet, GameConfig, GameItems, Indexes } from 'shared/types';

type Props = {
    coord: string;
    config: GameConfig;
    gameItems: GameItems;
    openedItems: CoordsSet;
    flaggedItems: CoordsSet;
    indexes: Indexes;
};
export const getFlaggedMines = ({
    coord,
    config,
    gameItems,
    openedItems,
    indexes,
    flaggedItems,
}: Props) => {
    const broSet = getBroCoords({ coord, config });

    const mines = broSet.filter((coord) => {
        const item = gameItems.get(coord);
        return isMine(item);
    });
    const openedBros = broSet.filter((coord) => openedItems.has(coord));

    const isWillFlag = mines.length === 8 - openedBros.length;
    const isWillOpenBros = !mines.some((coord) => !flaggedItems.has(coord)); //isAllFlagged

    let empty: CoordsSet = new Set();
    if (isWillOpenBros) {
        const willOpenBros = broSet.filter(
            (coord) => !openedItems.has(coord) && !mines.includes(coord),
        );
        empty = new Set(willOpenBros);

        willOpenBros.forEach((coord) => {
            const item = gameItems.get(coord);
            const broSet = isEmptyItem(item)
                ? indexes?.find((set) => set.has(coord)) || []
                : [];
            empty = new Set([...empty, ...broSet]);
        });
    }

    return {
        mines: isWillFlag ? mines : [],
        empty,
    };
};
