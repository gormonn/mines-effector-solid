import { getBroCoords } from 'entities/game/lib/get-bro-coords';
import { GameConfig } from 'shared/types';

/*
returns brothers of coords, using for forced mines/empty when create new game
*/
export const getForcedBros = (config: GameConfig, forcedBros?: string[]) => {
    return forcedBros
        ? forcedBros.reduce((acc, coord) => {
              const bros = getBroCoords({ coord, config });
              return [...acc, ...bros];
          }, [] as string[])
        : [];
};
