import { Match, Switch } from 'solid-js';
import { useGate, useUnit } from 'effector-solid/scope';
import { savePresetModel } from 'features/devtools/save-preset';
import { GameItems } from 'features/open-items';
import { gameModel, random } from 'entities/game';
import { CanvasRender, DomRender } from 'entities/render';
import { GameConfig, RenderType, StoreVersion } from 'shared/types';
import './container.scss';

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
const height = 33;
const width = 33;

// const config: GameConfig = { ...diagonal };
// const config: GameConfig = { ...vert };
// const config: GameConfig = { ...horiz };
// const config: GameConfig = { ...vertHoriz };
const config: GameConfig = {
    ...random(height),
    debugMode: true,
    indexing: true,
    render: RenderType.canvas,
    storeVersion: StoreVersion.v1,
    perfMeter: true,
    // withoutMines: true,
};
// const config: GameConfig = { ...diagonal2 }; // todo: не правильно открывается

export const Game = () => {
    // useGate(gameModel.newGame, { width, height, withoutMines: true });
    // useGate(gameModel.newGame, { width, height, withoutMines: false });
    useGate(gameModel.newGame, config);
    // useGate(model.newGame, testConfig02);

    const [saveGamePreset, gameConfig] = useUnit([
        savePresetModel.saveGamePreset,
        gameModel.$gameConfig,
    ]);

    return (
        <>
            <button onClick={() => saveGamePreset()}>
                Сохранить пресет игры
            </button>
            <div class="container">
                <Switch fallback={<>Loading...</>}>
                    <Match
                        keyed
                        when={gameConfig()?.render === RenderType.canvas}
                    >
                        <CanvasRender />
                    </Match>
                    <Match
                        keyed
                        when={
                            gameConfig()?.render === RenderType.dom ||
                            gameConfig()?.render === undefined
                        }
                    >
                        <DomRender>
                            <GameItems />
                        </DomRender>
                    </Match>
                </Switch>
            </div>
        </>
    );
};
