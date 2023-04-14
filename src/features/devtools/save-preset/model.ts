import { createEffect, createEvent, sample } from 'effector';
import { gameModel } from 'entities/game';
import { CoordsSet, GameConfig, Nullable } from 'shared/types';

type Props = {
    mines: CoordsSet;
    config: Nullable<GameConfig>;
};
const saveGamePreset = createEvent();
const saveGamePresetFx = createEffect(({ mines, config }: Props) => {
    const conf = {
        ...config,
        minesPreset: Array.from<string>(mines),
    };
    const content = JSON.stringify(conf);
    const file = new Blob([content], { type: 'text/plain' });

    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'gameConfig.json';
    document.body.append(a);
    a.click();
    URL.revokeObjectURL(url);
});

sample({
    clock: saveGamePreset,
    source: {
        mines: gameModel.$mineItems,
        config: gameModel.$gameConfig,
    },
    target: saveGamePresetFx,
});

export const model = {
    saveGamePreset,
};
