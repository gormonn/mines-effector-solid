import {Accessor, Component, createEffect, createMemo, createSignal, For, Index} from "solid-js";
import { useUnit } from "effector-solid/scope";
import {Coord, ItemCoord,GameItem} from "entities/mines/types";
import { gameModel } from "entities/mines/model";
import {isMine} from "entities/mines/model/lib";
import './items.scss'
import './numbers.scss'



export const GameItems = () => {
    const gameItems = useUnit(gameModel.$gameItems)

    // return <For each={Object.keys(gameItems())} fallback={<div>Loading...</div>}>
    return <Index each={[...gameItems()]} fallback={<div>Loading...</div>}>
        {(item, index) => {
            const [coord, gameItem] = item()
            // return (
            //     <div>
            //         {gameItem}
            //     </div>
            // )
            // return <GameItem coord={coord} gameItem={gameItem}/>
            return <GameItemCell item={item} mine={isMine(gameItem)}/>
        }}
    </Index>
    // return Object.keys(gameItems()).map((coord) => (
    //     <GameItem
    //         // key={coord}
    //         coord={coord}
    //         isOpen={openedItems().has(coord)}
    //         isMine={Boolean(gameItems()[coord])}
    //         // isOpen={openedItems.has(coord)}
    //         // isMine={Boolean(gameField[coord])}
    //         // isClickedMine={clickedMine === coord}
    //         isClickedMine={false}
    //         // openItem={openItem}
    //     />
    // ))
}

// type GameItemProps = {
//     isMine: boolean;
//     isClickedMine: boolean;
//     isOpen: boolean;
//   } & ItemCoord; // & WithItemOpener

// type GameItemProps = {
//     gameItem: GameItem;
//   } & ItemCoord;
type GameItemProps = {
    item: Accessor<[Coord, GameItem]>;
    mine: boolean;
};

// todo: check isOpen
// export const GameItem: Component<GameItemProps> = ({ isMine, isOpen, isClickedMine, coord }) => {
// export const GameItem: Component<GameItemProps> = ({ isClickedMine, coord, gameItem }) => {

export const GameItemCell: Component<GameItemProps> = ({ item, mine }) => {
    const [ openItem, openedItems, clickedMine ] = useUnit([
        gameModel.openItem,
        gameModel.$openedItems,
        gameModel.$clickedMine
    ])

    const opened = createMemo(() => {
        const [coord] = item();
        return openedItems().has(coord)
    });

    const openedMine = createMemo(() => {
        const [coord] = item();
        return clickedMine() === coord
    });

    const [coord, gameItem] = item();

    return <div
        classList={{ item: true, opened: opened() }}
        onClick={() => openItem(coord)}
    >
        {opened() ? (
            mine
                ? (<div classList={{ mine, opened: openedMine() }} />)
                : (<div class={`num_${gameItem}`}
                    // onClick={} // todo: open bro-coords
                />)
        ) : null}
    </div>
} 
