import { ReactiveMap } from '@solid-primitives/map';
import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import { useUnit } from 'effector-solid/scope';
import { openItemsModel } from 'features/open-items';
import { gameModel } from 'entities/game';
import { getBroCoords } from 'entities/game/lib/get-bro-coords'; // todo: импорт на одном уровне
import { formatCoords, isMine, isNumber, parseCoords } from 'shared/lib';
import { GameItemEnum, MouseControls } from 'shared/types';
import './styles.css';

// todo: create theming
const styles = {
    stroke: 'black',
    item: {
        hoverOff: {
            borderColor: '#4bd6c8',
            background: 'transparent',
        },
        hoverOn: {
            borderColor: '#54f0e0',
            background: 'rgba(255, 255, 255, 0.2)',
        },
        active: {
            borderColor: '#277069',
            background: 'rgba(255, 255, 255, 0.1)',
        },
        opened: {
            borderColor: '#8a9fb5',
            background: '#a7c0db',
        },
    },
    mine: {
        background: 'black',
        borderColor: '#8a9fb5',
        touched: {
            background: 'red',
            borderColor: 'transparent',
        },
    },
    n1: 'rgb(19, 0, 128)',
    n2: 'green',
    n3: 'rgb(128, 0, 0)',
    n4: 'rgb(0, 128, 53)',
    n5: 'rgb(0, 119, 128)',
    n6: 'rgb(128, 0, 111)',
    n7: 'rgb(128, 0, 100)',
    n8: 'rgb(128, 126, 0)',
};

const size = 24;
const shapeKey = (x: number, y: number) => `${x}-${y}`;

const mine = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const rad = size / 2;
    const px = x * size;
    const py = y * size;

    ctx.beginPath();
    ctx.arc(px + rad, py + rad, rad / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = styles.mine.borderColor;
    ctx.stroke();
    ctx.fillStyle = styles.mine.background;
    ctx.fill();
};

const number = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    type: Omit<GameItemEnum, 'flag' | 'mine' | 'empty'>,
) => {
    const rad = size / 2;
    const px = x * size;
    const py = y * size;
    const fontSize = size / 1.25;

    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';
    ctx.font = `bold ${fontSize}px sans-serif`;
    ctx.fillStyle = styles[`n${type}`];
    ctx.fillText(type as string, px + rad, py + fontSize / 4);
};

const flag = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    const rad = size / 2;
    const px = x * size;
    const py = y * size;

    ctx.beginPath();
    ctx.arc(px + rad, py + rad, rad / 2, 0, 2 * Math.PI);
    ctx.strokeStyle = styles.mine.borderColor;
    ctx.stroke();
    ctx.fillStyle = 'green';
    ctx.fill();
};

const shapes = {
    mine,
    number,
    flag,
};

const setFill = (
    ctx: CanvasRenderingContext2D,
    shape: Path2D,
    style: { borderColor: string; background: string },
) => {
    ctx.save();
    ctx.clip(shape);
    ctx.lineWidth *= 1;
    ctx.fillStyle = style.background;
    ctx.fill(shape);
    ctx.strokeStyle = style.borderColor;
    ctx.stroke(shape);
    ctx.restore();
};

const resetFill = (
    x: number,
    y: number,
    ctx: CanvasRenderingContext2D,
    shape: Path2D,
    style: { borderColor: string; background: string },
) => {
    ctx.clearRect(x * size, y * size, size, size);
    setFill(ctx, shape, style);
};

type ShapesMapItem = {
    shape: Path2D;
    isOpen?: boolean;
    itemType?: GameItemEnum | undefined;
};

type CreateShapeProps = {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    shapesMap: ReactiveMap<string, ShapesMapItem>;
    itemType?: GameItemEnum;
    isOpen?: boolean;
    isFlagged?: boolean;
    debugMode?: boolean;
};

// todo: wtf, нахера мне дублировать состояние???
const createShape = ({
    ctx,
    x,
    y,
    shapesMap,
    itemType,
    isOpen = false,
    isFlagged = false,
    debugMode = false,
}: CreateShapeProps) => {
    const shape = new Path2D();
    shape.rect(x * size, y * size, size, size);

    const fill = (() => {
        if (debugMode) {
            return styles.item.hoverOff;
        } else if (isOpen) {
            return styles.item.opened;
        } else {
            return styles.item.hoverOff;
        }
    })();

    setFill(ctx, shape, fill);

    if (debugMode) {
        if (isFlagged) {
            shapes.flag(ctx, x, y);
        } else if (itemType) {
            if (isMine(itemType)) {
                shapes.mine(ctx, x, y);
            } else if (isNumber(itemType)) {
                shapes.number(ctx, x, y, itemType);
            }
        }
    } else {
        if (isFlagged) {
            shapes.flag(ctx, x, y);
        } else if (itemType && isOpen) {
            if (isMine(itemType)) {
                shapes.mine(ctx, x, y);
            } else if (isNumber(itemType)) {
                shapes.number(ctx, x, y, itemType);
            }
        }
    }

    shapesMap.set(shapeKey(x, y), { shape, isOpen, itemType });
    // shapesMap.set(shapeKey(x, y), { shape, isOpen: true, itemType });
};

type CreateHintProps = {
    ctx: CanvasRenderingContext2D;
    x: number;
    y: number;
    itemType?: GameItemEnum;
};
const createHint = ({ ctx, x, y, itemType }: CreateHintProps) => {
    const shape = new Path2D();
    shape.rect(x * size, y * size, size, size);

    ctx.strokeStyle = (() => {
        switch (itemType) {
            default:
            case GameItemEnum.empty:
                return 'white';
            case GameItemEnum.mine:
                return 'red';
            case GameItemEnum.n1:
            case GameItemEnum.n2:
            case GameItemEnum.n3:
            case GameItemEnum.n4:
            case GameItemEnum.n5:
            case GameItemEnum.n6:
            case GameItemEnum.n7:
            case GameItemEnum.n8:
            case GameItemEnum.n9:
                return 'yellow';
        }
    })();
    ctx.stroke(shape);
};

// todo: move to widgets
export const CanvasRender = () => {
    let canvas: HTMLCanvasElement;
    let canvasOverlay: HTMLCanvasElement;
    const shapesMap = new ReactiveMap<string, ShapesMapItem>();

    const [
        config,
        gameItems,
        clickItem,
        openedItems,
        flaggedItems,
        clickedMine,
        hintedNumbers,
    ] = useUnit([
        gameModel.$config,
        gameModel.$gameItems,
        openItemsModel.clickItem,
        openItemsModel.$openedItems,
        openItemsModel.$flaggedItems,
        openItemsModel.$clickedMine,
        openItemsModel.$hintedNumbers,
    ]);

    const width = (config()?.width || 1) * size;
    const height = (config()?.height || 1) * size;
    const { debugMode, perfMeter, overlayMode } = config() || {};

    const [pointerX, setPointerX] = createSignal(0);
    const [pointerY, setPointerY] = createSignal(0);

    const getCursorPoint = () => {
        const px = pointerX();
        const py = pointerY();
        return {
            x: Math.floor(px / size),
            y: Math.floor(py / size),
            px,
            py,
        };
    };

    onMount(() => {
        function mouseMove(e: MouseEvent) {
            // todo: add throttle?
            // const rect = this.getBoundingClientRect(); // todo: wth this?
            const rect = canvas.getBoundingClientRect();
            const step = 1;
            const nextX = e.clientX - rect.left;
            const nextY = e.clientY - rect.top;
            if (Math.abs(pointerX() - nextX) >= step) setPointerX(nextX);
            if (Math.abs(pointerY() - nextY) >= step) setPointerY(nextY);
        }

        canvas.addEventListener('mousemove', mouseMove);

        // const ctxOverlay = canvasOverlay?.getContext('2d');
        // const loop: FrameRequestCallback = () => {
        //     frame = requestAnimationFrame(loop);
        //     if (ctxOverlay) {
        //         const { px, py } = getCursorPoint();
        //         ctxOverlay.clearRect(0, 0, width, height);
        //         ctxOverlay.rect(px, py, 50, 25);
        //         ctxOverlay.stroke();
        //     }
        // };

        // let frame = requestAnimationFrame(loop);

        onCleanup(() => {
            // cancelAnimationFrame(frame);
            canvas.removeEventListener('mousemove', mouseMove);
        });
    });

    // перерисовка при смене поля
    createEffect(() => {
        if (perfMeter) console.time('draw-reset-game');

        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, width, height);
            const items = gameItems();

            // rects:
            items.forEach((gameItem, coord) => {
                // todo: use gameItemV2 without parsing
                const [x, y] = parseCoords(coord);
                const itemType = items.get(coord);
                createShape({
                    ctx,
                    x,
                    y,
                    shapesMap,
                    itemType,
                    debugMode,
                });
            });

            // triangles:
            // items.forEach((gameItem, coord) => {
            //     const [x, y] = parseCoords(coord);
            //     const offsetY = x % 2 ? size / 2 : 0;
            //     const offsetX = y % 2 ? size / 2 : 0;
            //     ctx.rect(x * size + offsetX, y * size + offsetY, size, size);
            //     // ctx.rect(x * size, y * size + offsetY, size, size);
            //     ctx.stroke();
            // });
        }
        if (perfMeter) console.timeEnd('draw-reset-game');
    });

    // todo: а что это?
    // createEffect(() => {
    //     const ctx = canvas.getContext('2d');
    //     const { x, y, px, py } = getCursorPoint();
    //     const prevKey = prevShapeKey();
    //     const nextKey = shapeKey(x, y);
    //     // const { shape, isOpen } = shapesMap.get(nextKey) || {};
    //
    //     if (ctx) {
    //         // todo: багнуто
    //         // if (!isOpen && shape) {
    //         //     // todo: проверить что это не рисуется много раз
    //         //     const isPointInPath = ctx.isPointInPath(shape, px, py);
    //         //
    //         //     resetFill(
    //         //         x,
    //         //         y,
    //         //         ctx,
    //         //         shape,
    //         //         isPointInPath ? styles.item.hoverOn : styles.item.hoverOff,
    //         //     );
    //         // }
    //         //
    //         // if (prevKey && prevKey !== nextKey) {
    //         //     const { shape } = shapesMap.get(prevKey);
    //         //     const [x, y] = parseCoords(prevKey);
    //         //     resetFill(x, y, ctx, shape, styles.item.hoverOff);
    //         // }
    //         //
    //         // if (!isOpen && prevKey !== nextKey) {
    //         //     setPrevShapeKey(nextKey);
    //         // }
    //     }
    // });

    // перерисовка при открытии полей
    createEffect(() => {
        if (perfMeter) console.time('draw-opened-items');

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const opened = openedItems();
            const items = gameItems();

            // rects:
            opened.forEach((gameItem, coord) => {
                // todo: use gameItemV2 without parsing
                const [x, y] = parseCoords(coord);
                const itemType = items.get(coord);
                createShape({
                    ctx,
                    x,
                    y,
                    shapesMap,
                    itemType,
                    isOpen: true,
                });
            });
        }
        if (perfMeter) console.timeEnd('draw-opened-items');
    });

    // перерисовка при проставлении флажков
    createEffect(() => {
        if (perfMeter) console.time('draw-flags');

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const flagged = flaggedItems();
            const items = gameItems();

            // rects:
            flagged.forEach((gameItem, coord) => {
                // todo: use gameItemV2 without parsing
                const [x, y] = parseCoords(coord);
                const itemType = items.get(coord);
                createShape({
                    ctx,
                    x,
                    y,
                    shapesMap,
                    itemType,
                    isFlagged: true,
                });
            });
        }
        if (perfMeter) console.timeEnd('draw-flags');
    });

    // перерисовка при получении подсказок
    createEffect(() => {
        if (perfMeter) console.time('draw-hints');

        const ctx = canvas.getContext('2d');
        if (ctx) {
            const hints = hintedNumbers();
            const items = gameItems();

            // rects:
            hints.forEach((gameItem, coord) => {
                const [x, y] = parseCoords(coord);
                const itemType = items.get(coord);
                createHint({
                    ctx,
                    x,
                    y,
                    itemType,
                });
            });
        }
        if (perfMeter) console.timeEnd('draw-hints');
    });

    // todo: clicked mine
    createEffect(() => {
        const ctx = canvas.getContext('2d');
        const clickedMineKey = clickedMine();
        if (ctx && clickedMineKey) {
            const { shape } = shapesMap.get(clickedMineKey) || {};
            if (shape) {
                const [x, y] = parseCoords(clickedMineKey);

                resetFill(x, y, ctx, shape, styles.mine.touched);

                shapes.mine(ctx, x, y);
            }
        }
    });

    // (overlay-with-points)
    createEffect(() => {
        const ctxOverlay = canvasOverlay?.getContext('2d');
        if (ctxOverlay) {
            const { x, y } = getCursorPoint();
            const coord = formatCoords(x, y);
            if (!coord) return;

            const bros = getBroCoords({ coord, config: config() || undefined });

            ctxOverlay.clearRect(0, 0, width, height);

            const top = 50;
            const left = 25;
            const coords = [...bros, coord];

            coords.forEach((coord) => {
                const [x, y] = parseCoords(coord);
                ctxOverlay.strokeRect(x * size, y * size, size, size);
            });

            ctxOverlay.fillStyle = 'white';
            ctxOverlay.fillRect(
                x * size + size * 2,
                y * size - size,
                top * 3,
                left * 3,
            );

            const groupedCoords = coords
                .reduce((acc, coord) => {
                    const [x, y] = parseCoords(coord);
                    if (!acc[y]) acc[y] = [];
                    acc[y].push(coord);
                    return acc;
                }, [] as string[][])
                .filter((a) => a)
                .map((coords) => coords.sort());

            groupedCoords.forEach((coords) => {
                const text = coords.join('  ');
                const [x, y] = parseCoords(coords[0]);
                ctxOverlay.textBaseline = 'top';
                ctxOverlay.textAlign = 'left';
                ctxOverlay.font = `bold 12px sans-serif`;
                ctxOverlay.fillStyle = 'black';

                ctxOverlay.fillText(text, x * size + size * 3 + 2, y * size);
            });
        }
    });

    // (click-on-item)
    const mouseUpHandler = ({ button }: MouseEvent) => {
        const { x, y } = getCursorPoint();
        clickItem({ coord: shapeKey(x, y), button });
    };

    // (mouse-down-on-item) todo: remove?
    const mouseDownHandler = (e: MouseEvent) => {
        const ctx = canvas.getContext('2d');
        if (ctx && e.button === MouseControls.Left) {
            const { x, y } = getCursorPoint();
            const nextKey = shapeKey(x, y);
            const { shape, isOpen } = shapesMap.get(nextKey) || {};
            if (!isOpen && shape) {
                resetFill(x, y, ctx, shape, styles.item.active);
            }
        }
    };

    return (
        <>
            <canvas
                ref={canvas}
                class="game-field"
                width={width}
                height={height}
                // onKeyUp={keyUpHandler}
                onMouseUp={mouseUpHandler}
                onMouseDown={mouseDownHandler}
            />
            <Show when={overlayMode} keyed>
                <canvas
                    ref={canvasOverlay}
                    class="game-overlay"
                    width={width}
                    height={height}
                />
            </Show>
        </>
    );
};
