import { Nullable } from 'shared/types';

export default class SmallTooltip {
    allTipsSelector: string;

    isIn: boolean;

    lastText: string;

    dom: Nullable<HTMLDivElement>;

    constructor() {
        this.allTipsSelector = '*[data-tip]';
        this.isIn = false;
        this.lastText = '';
        this.dom = document.querySelector('#small-tooltip');
        this.events();
    }

    events() {
        document.addEventListener('mouseover', (e) => {
            const tip: Nullable<HTMLElement> = (
                e?.target as HTMLElement
            ).closest(this.allTipsSelector);

            if (tip) {
                const text = tip.dataset.tip || '';
                if (!this.isIn || (text && this.lastText !== text)) {
                    this.isIn = true;
                    this.showSmallTooltip(e, text);
                    this.lastText = text;
                }
            } else if (this.isIn) {
                this.isIn = false;
                this.hideSmallTooltip();
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isIn) {
                this.moveSmallTooltip(e);
            }
        });
    }

    showSmallTooltip(e: MouseEvent, text: string) {
        if (this.isIn) {
            this.dom = document.querySelector('#small-tooltip');
            if (this.dom) {
                this.dom.classList.add('show');
                this.moveSmallTooltip(e);
                this.dom.innerHTML = text;
            }
        }
    }

    hideSmallTooltip() {
        this.dom = document.querySelector('#small-tooltip');
        if (this.dom) {
            this.dom.classList.remove('show');
        }
    }

    moveSmallTooltip(e: MouseEvent) {
        if (this.isIn) {
            this.dom = document.querySelector('#small-tooltip');
            if (this.dom) {
                this.dom.style.top = `${e.pageY}px`;
                this.dom.style.left = `${e.pageX}px`;
            }
        }
    }

    // eslint-disable-next-line class-methods-use-this
    init() {
        // do nothing
    }
}
