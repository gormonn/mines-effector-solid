import { JSXElement } from 'solid-js';
import { render } from 'solid-js/web';
import { fork } from 'effector';
import { Provider } from 'effector-solid/scope';
import App from 'app/app';
import { SmallToolTipPortal } from 'shared/small-tooltip';
import 'app/index.css';

const scope = fork();

render(
    () =>
        (
            <Provider value={scope}>
                <App />
                <SmallToolTipPortal />
            </Provider>
        ) as JSXElement,
    document.getElementById('root') as HTMLElement,
);
