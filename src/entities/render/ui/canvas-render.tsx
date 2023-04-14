import { onCleanup, onMount } from 'solid-js';
import { useUnit } from 'effector-solid/scope';
import { gameModel } from 'entities/game';
import { parseCoords } from 'shared/lib';

const size = 24;
export const CanvasRender = () => {
    let canvas: HTMLCanvasElement;

    const [config, gameItems] = useUnit([
        gameModel.$gameConfig,
        gameModel.$gameItems,
    ]);

    onMount(() => {
        const ctx = canvas.getContext('2d');

        const loop: FrameRequestCallback = (t) => {
            frame = requestAnimationFrame(loop);

            // if (!ctx) return;

            const items = gameItems();

            items.forEach((gameItem, coord) => {
                // switch (gameItem){
                //     case
                // }
                // console.log(value, key, 'value, key');
                const [x, y] = parseCoords(coord);
                ctx.rect(x * size, y * size, size, size);
                ctx.stroke();
                // ctx.fill();
            });

            // const imageData = ctx.getImageData(
            //     0,
            //     0,
            //     canvas.width,
            //     canvas.height,
            // );
            //
            // for (let p = 0; p < imageData.data.length; p += 4) {
            //     const i = p / 4;
            //     const x = i % canvas.width;
            //     const y = (i / canvas.height) >>> 0;
            //
            //     const r =
            //         64 + (128 * x) / canvas.width + 64 * Math.sin(t / 1000);
            //     const g =
            //         64 + (128 * y) / canvas.height + 64 * Math.cos(t / 1000);
            //     const b = 128;
            //
            //     imageData.data[p] = r;
            //     imageData.data[p + 1] = g;
            //     imageData.data[p + 2] = b;
            //     imageData.data[p + 3] = 255;
            // }
            //
            // ctx.putImageData(imageData, 0, 0);
        };

        let frame = requestAnimationFrame(loop);

        onCleanup(() => {
            cancelAnimationFrame(frame);
        });
    });

    return (
        <canvas
            ref={canvas}
            width={config()?.width * size}
            height={config()?.height * size}
        />
    );
};
