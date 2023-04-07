import { createDomain, createEvent, createStore, restore, sample } from "effector";
import { createGate } from "effector-solid"; 
import { condition, reset, spread } from "patronum";
import { noise } from "shared/noise";
import { Nullable } from "shared/types";
import { GameConfig, GameItems, CoordsSet, Coord, GameItem } from "../types";
import { formatCoords, getBroCoords, isMine } from "./lib";


const domain = createDomain('game-mines');


domain.onCreateDomain(domain => {
    console.log('new domain created')
})

const newGame = createGate<GameConfig>({ 
    name: 'new-game',
    domain,
    defaultState: {
        width: 10,
        height: 10,
        showAllMines: true 
    }
});

const setMineItems = domain.createEvent<CoordsSet>();
const $mineItems = restore(setMineItems, null);
// const $mineItems = createStore<Nullable<CoordsSet>>(null);
 

const setGameItems = domain.createEvent<GameItems>();
// const $gameItems = restore(setGameItems, {}); 
const $gameItems =  domain.createStore<Nullable<GameItems>>({}); 

sample({
    clock: setGameItems,
    target: $gameItems
})

const openItem = domain.createEvent<Coord>();
const setOpenedItems = domain.createEvent<CoordsSet>();
const $openedItems = restore(setOpenedItems, new Set<string>());
// const $openedItems = createStore<Nullable<CoordsSet>>(null); 

const $clickedMine = domain.createStore<Nullable<Coord>>(null);
const $isGameOver = domain.createStore(false);

const setStartTime = domain.createEvent<string>();
const $startTime = restore(setStartTime, null); 
// const $startTime = createStore<Nullable<string>>(null); 
const $endTime = domain.createStore<Nullable<string>>(null); 


// todo: is win

reset({
    clock: newGame.state,
    target: [
        $mineItems,
        $gameItems,
        $openedItems,
        $isGameOver,
        $clickedMine,
        $startTime
    ]
})

sample({
    source: $clickedMine,
    fn: (clickedMine) => Boolean(clickedMine),
    target: $isGameOver
})

sample({
    source: {
        mineItems: $mineItems,
        openedItems: $openedItems
    },
    filter: ({ mineItems, openedItems }) => Boolean(mineItems && openedItems),
    fn: ({ mineItems, openedItems }) => 
        (openedItems && mineItems)
            ? Array.from(openedItems).find((openedItem) => mineItems.has(openedItem))
                || null
            : null,
    target: $clickedMine
})

sample({
    clock: openItem,
    source: $openedItems,
    // todo: add filter by empty or number
    // filter: ,
    fn: (openedItems, coord) => {
        // todo: add open bro coords

        const newSet = new Set(openedItems);
        newSet.add(coord);
        return newSet;
        // todo: check it:
        //  return new Set([...Array.from(openedItems), coord])
    },
    target: $openedItems
})

sample({
    clock: newGame.open, 
    source: newGame.state,
    fn: ({ width, height }) => {
        const mines = new Set<string>();
        const gameItems: GameItems = {};

        // for (let y = 0; y < height; y++) {
        //   for (let x = 0; x < width; x++) {
        //     let nx = x / width - 0.5,
        //       ny = y / height - 0.5;

        //     // 0 - empty?
        //     // 1 - mine?
        //     const val = noise(50 * nx, 50 * ny) > 0.5 ? 1 : 0;
        //     const keyCoord = setCoordsKey([x, y]);
        //     gameItems[keyCoord] = val;
        //     if (val) mines.add(keyCoord);
        //   }
        // }
 
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let nx = x / width - 0.5,
                ny = y / height - 0.5;
    
                const val = noise(50 * nx, 50 * ny) > 0.5 ? GameItem.mine : GameItem.empty;
                const keyCoord = formatCoords(x, y);
                gameItems[keyCoord] = val;
                if (val) mines.add(keyCoord);
            }
        }
        
        Object.keys(gameItems).forEach(coord => {
            if(!isMine(gameItems[coord])){
                const broCoords = getBroCoords({ coord });
                const minesAroundCount = broCoords.reduce(
                    (acc, broCoordKey) =>
                        isMine(gameItems[broCoordKey]) ? acc + gameItems[broCoordKey] : acc,
                    0
                );
                gameItems[coord] = minesAroundCount
            }
        });
        
        return { gameItems, mines, startTime: new Date().toISOString() };
    },
    // target: spread({ 
    //     targets: {
    //         mines: $mineItems,
    //         gameItems: $gameItems,
    //         startTime: $startTime
    //     }
    // })
    target: spread({ 
        targets: {
            mines: setMineItems,
            gameItems: setGameItems,
            startTime: setStartTime
        }
    })
})



export const model = {
    newGame,
    $mineItems,
    $gameItems,
    openItem,
    $openedItems,
    $clickedMine,
    $isGameOver,
    $startTime,
    setGameItems
}
// export const model = {domain}