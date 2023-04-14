import type { ParentProps } from 'solid-js';
import { useUnit } from 'effector-solid/scope';
import { gameModel } from 'entities/game';
import './dom-render.css';

export const DomRender = (props: ParentProps) => {
    const [config] = useUnit([gameModel.$gameConfig]);

    return (
        <div class="flex">
            <div
                class="grid"
                style={{
                    'grid-template-rows': `repeat(${
                        config()?.height ?? 1
                    }, 24px)`,
                    'grid-template-columns': `repeat(${
                        config()?.width ?? 1
                    }, 24px)`,
                }}
            >
                {props.children}
            </div>
        </div>
    );
};
