import { useGate } from 'effector-solid/scope';
import { GameItems } from './ui/items';
import { gameModel } from 'entities/mines/model';
import './ui/container.scss';

const height = 2;
const width = 2;

export const Game = () => {
    useGate(gameModel.newGame, { width, height, showAllMines: true });

    return (
        <div class="container">
            <div class="flex">
                <div
                    class="grid"
                    style={`
                        grid-template-rows: repeat(${height}, 24px);
                        grid-template-columns: repeat(${width}, 24px);
                    `}
                >
                    <GameItems />

                    {/* todo: refactoring? useStoreMap? */}
                </div>
            </div>
        </div>
    );
};
