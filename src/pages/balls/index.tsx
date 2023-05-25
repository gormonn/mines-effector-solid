import { onCleanup, onMount } from 'solid-js';

const extractPixelColor = (
    data: Uint8ClampedArray,
    cols: number,
    x: number,
    y: number,
) => {
    return data[(cols * x + y) * 4];
    // const pixel = cols * x + y;
    // const position = pixel * 4;
    // return {
    //     red: data[position],
    //     green: data[position + 1],
    //     blue: data[position + 2],
    //     alpha: data[position + 3],
    // };
};

const speed = 3;
// const width = speed * 75;
// const height = speed * 75;
const width = 300;
const height = 600;
export const Balls = () => {
    let canvas: HTMLCanvasElement;

    onMount(() => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.rect(0.5, 0.5, canvas.width - 1, canvas.height - 1);
            ctx.strokeStyle = 'white';
            ctx.stroke();
        }

        // let prev = 0;
        let prevPoint = [100, 50];
        let nextPoint = [0, 0];
        // const tm = 11;
        const direction = [1, 1];
        const loop: FrameRequestCallback = (t) => {
            // const next = Math.floor(t / tm);
            // const next = t;
            frame = requestAnimationFrame(loop);

            if (ctx) {
                nextPoint = [
                    prevPoint[0] + speed * direction[0],
                    prevPoint[1] + speed * direction[1],
                ];

                const isCollisionX = nextPoint[0] >= width || nextPoint[0] < 0;
                const isCollisionY = nextPoint[1] >= height || nextPoint[1] < 0;
                if (isCollisionX) {
                    direction[0] *= -1;
                    nextPoint[0] = prevPoint[0] + speed * direction[0];
                } else if (isCollisionY) {
                    direction[1] *= -1;
                    nextPoint[1] = prevPoint[1] + speed * direction[1];
                }

                ctx.clearRect(1, 1, canvas.width - 2, canvas.height - 2);

                ctx.arc(nextPoint[0], nextPoint[1], 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'white';
                ctx.fill();

                ctx.beginPath();
                ctx.moveTo(prevPoint[0], prevPoint[1]);
                ctx.lineTo(nextPoint[0], nextPoint[1]);
                ctx.strokeStyle = 'white';
                ctx.stroke();

                prevPoint = nextPoint;
            }
            // prev = next;
        };

        let frame = requestAnimationFrame(loop);

        onCleanup(() => {
            cancelAnimationFrame(frame);
        });
    });

    return (
        <canvas
            ref={canvas}
            width={width}
            height={height}
            // style={`border: 1px solid white;`}
        />
    );
};
