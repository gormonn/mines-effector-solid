import { useGate } from 'effector-solid/scope';
import { GameItems } from './ui/items';
import { gameModel } from 'entities/mines/model';
import './ui/container.scss';
import { diagonal, horiz, random, vert, vertHoriz } from 'shared/test-cases';
import { GameConfig } from 'entities/mines/types';

const height = 33;
const width = 33;

// const config: GameConfig = { ...diagonal }; // todo: wrong numbers
// const config: GameConfig = { ...vert }; // todo: wrong numbers
// const config: GameConfig = { ...horiz };
// const config: GameConfig = { ...vertHoriz };
const config: GameConfig = { ...random(height) };

export const Game = () => {
    // useGate(gameModel.newGame, { width, height, withoutMines: true });
    // useGate(gameModel.newGame, { width, height, withoutMines: false });
    useGate(gameModel.newGame, config);

    return (
        <>
            <div class="container">
                <div class="flex">
                    <div
                        class="grid"
                        style={`
                        grid-template-rows: repeat(${config.height}, 24px);
                        grid-template-columns: repeat(${config.width}, 24px);
                    `}
                    >
                        <GameItems />

                        {/* todo: refactoring? useStoreMap? */}
                    </div>
                </div>
            </div>
        </>
    );
};
