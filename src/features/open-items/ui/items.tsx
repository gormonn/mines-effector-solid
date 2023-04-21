import type { Accessor } from 'solid-js';
import { createMemo, Index } from 'solid-js';
import { useUnit } from 'effector-solid/scope';
import { gameModel } from 'entities/game';
import { isMine } from 'shared/lib';
import { Coord, GameItemEnum } from 'shared/types';
import { model } from '../model';
import './items.scss';
import './numbers.scss';

// todo: move to widgets
export const GameItems = () => {
    const [gameItems] = useUnit([gameModel.$gameItems]);

    return (
        <Index each={[...gameItems()]} fallback={<div>Loading...</div>}>
            {(item, index) => {
                const [coord, gameItem] = item();
                return <GameItemCell item={item} mine={isMine(gameItem)} />;
            }}
        </Index>
    );
};

type GameItemProps = {
    item: Accessor<[Coord, GameItemEnum]>;
    mine: boolean;
};

export const GameItemCell = (props: GameItemProps) => {
    const [openItem, clickItem, openedItems, clickedMine, debugMode] = useUnit([
        model.openItem,
        model.clickItem,
        model.$openedItems,
        model.$clickedMine,
        gameModel.$debugMode,
    ]);

    const opened = createMemo(() => {
        const [coord] = props.item();
        return openedItems().has(coord);
    });

    const openedMine = createMemo(() => {
        const [coord] = props.item();
        return clickedMine() === coord;
    });

    const [coord, gameItem] = props.item();

    const children = props.mine ? (
        <div classList={{ mine: props.mine, opened: openedMine() }} />
    ) : (
        <div class={`num_${gameItem}`} />
    );

    return (
        <div
            data-tip={coord}
            classList={{ item: true, opened: opened() }}
            // onClick={() => openItem(coord)}
            onClick={() => clickItem(coord)}
            // onClick={() => model.clickItem(coord)}
        >
            {opened() ? children : debugMode() ? children : null}
        </div>
    );
};
