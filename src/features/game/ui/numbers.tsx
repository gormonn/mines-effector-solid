import { Component } from "solid-js";
import {ItemCoord, NumberItems, WithItemOpener} from "entities/mines/types";
import './numbers.scss'


export const Numbers: Component<{ gameItem: NumberItems }> = ({
  gameItem
}) => {
    return gameItem
        ? <div class={`num_${gameItem}`}
            // onClick={} // todo: open bro-coords
        />
        : null
}

// const minesMap = useMinesContext();

//   const minesAroundCount = useMemo(() => {
//     const broCoords = getBroCoords({ coord });
//     // console.log("broCoords", broCoords);
//     return broCoords.reduce(
//       (acc, coordsKey) =>
//         minesMap[coordsKey] ? acc + minesMap[coordsKey] : acc,
//       0
//     );
//   }, [minesMap, coord]);

//   useEffect(() => {
//     // todo: if gameid equal
//     // if(prevGameId === nextGameId)
//     if (!minesAroundCount) {
//       // getClosestBros({ coord });
//       // const broCoords = getBroCoords({ coord });
//       // broCoords.forEach((broCoord) => {
//       //   openItem(broCoord);
//       // });
//     }
//   }, [minesAroundCount, openItem, coord, prevGameId, nextGameId]);