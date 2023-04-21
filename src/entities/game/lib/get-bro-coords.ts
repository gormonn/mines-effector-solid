import { formatCoords, parseCoords } from 'shared/lib/utils';
import { GetBroCoordsProps } from './type';

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
export const getBroCoords = ({
    coord,
    config,
    filterFn,
    diagonal = true,
}: GetBroCoordsProps): string[] => {
    const [x, y] = parseCoords(coord);

    const lt = diagonal ? formatCoords(x - 1, y - 1, config) : null;
    const lm = formatCoords(x - 1, y, config);
    const lb = diagonal ? formatCoords(x - 1, y + 1, config) : null;

    const t = formatCoords(x, y - 1, config);
    const b = formatCoords(x, y + 1, config);

    const tr = diagonal ? formatCoords(x + 1, y - 1, config) : null;
    const mr = formatCoords(x + 1, y, config);
    const br = diagonal ? formatCoords(x + 1, y + 1, config) : null;

    const result = [lt, lm, lb, t, b, tr, mr, br];

    if (filterFn) {
        return result.filter(filterFn) as string[];
    } else if (!diagonal) {
        return result.filter((v) => v) as string[];
    }
    return result as string[];
};
