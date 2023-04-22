import { createEffect, Match, onCleanup, onMount, Switch } from 'solid-js';
import { useGate, useUnit } from 'effector-solid/scope';
import { LoserModal } from 'widgets/game/ui/loser-modal';
import { WinnerModal } from 'widgets/game/ui/winner-modal';
import { savePresetModel } from 'features/devtools/save-preset';
import { GameItems, openItemsModel } from 'features/open-items';
import { gameModel, random } from 'entities/game';
import { CanvasRender, DomRender } from 'entities/render';
import { GameConfig, RenderType, StoreVersion } from 'shared/types';
import 'widgets/game/container.scss';

// todo: до 81 генерится +- с одинаковой скоростью 60-80ms
//  после 81 - занимает в 10 раз больше времени 152+ ms 83=300ms

// todo: что если генерировать поле "на лету"?
//  - так как существует допущение того,
//  что все не открытое поле для нас - это черный ящик,
//  мы можем "догружать"/"догенерировать" карту после

// todo: как вариант, реализовать "батчинг", т.е. разбить генерацию на части
// todo: если делать мультиплеер, то таким образом, можно реализовать децентрализованный
//  p2p-клиент:
//  - каждый клиент генерирует свою часть поля
//     - годится для PvP с разными полями
//     - не годится для Coop или PvP с одинаковыми полями
//  - для Coop это должно быть на уровне хоста/сервера
//  - Ladder? чисто на сервере или на клиенте? что сложнее подделать и перехватить?
const height = 10;
const width = 33;

// const config: GameConfig = { ...diagonal };
// const config: GameConfig = { ...vert };
// const config: GameConfig = { ...horiz };
// const config: GameConfig = { ...vertHoriz };
const gameConfig: GameConfig = {
    ...random(height),
    indexing: true,
    render: RenderType.canvas,
    storeVersion: StoreVersion.v1,
    // debugMode: true,
    // infinityMode: true,
    // perfMeter: true,

    // overlayMode: true,
    // forcedMinesBros: ['2-2', '2-5'],
    // forcedEmptyBros: ['2-2', '2-5'],
    // forcedOpen: '2-2',
    // withoutMines: true,
};
// const config: GameConfig = { ...diagonal2 }; // todo: не правильно открывается

export const Game = () => {
    // useGate(gameModel.newGame, { width, height, withoutMines: true });
    // useGate(gameModel.newGame, { width, height, withoutMines: false });
    // useGate(gameModel.newGame, config);
    useGate(gameModel.newGame, gameConfig);

    const [
        devOpenAll,
        hintNumber,
        hintedNumbers,
        hintMine,
        saveGamePreset,
        config,
        startTime,
    ] = useUnit([
        openItemsModel.devOpenAll,
        openItemsModel.hintNumber,
        openItemsModel.$hintedNumbers,
        openItemsModel.hintMine,
        savePresetModel.saveGamePreset,
        gameModel.$config,
        gameModel.$startTime,
    ]);

    const contextMenuDisable = (e: MouseEvent) => {
        e.preventDefault();
    };

    return (
        <>
            {/*<button onClick={saveGamePreset}>Сохранить пресет игры</button>*/}
            {/*<button onClick={hintNumber}>Hint Number</button>*/}
            {/*<button onClick={hintMine}>Hint Mine</button>*/}
            {/*<button onClick={devOpenAll}>open all</button>*/}
            <div class="container" onContextMenu={contextMenuDisable}>
                <Switch fallback={<>Loading...</>}>
                    <Match keyed when={config()?.render === RenderType.canvas}>
                        <CanvasRender />
                    </Match>
                    <Match
                        keyed
                        when={
                            config()?.render === RenderType.dom ||
                            config()?.render === undefined
                        }
                    >
                        <DomRender>
                            <GameItems />
                        </DomRender>
                    </Match>
                </Switch>
            </div>
            <WinnerModal />
            <LoserModal />
        </>
    );
};
