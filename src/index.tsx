/* @refresh reload */
import { render } from 'solid-js/web';
import { fork } from 'effector'
import { Provider } from 'effector-solid/scope'

import './index.css';
import App from './App';

const scope = fork()

render(
    () => <Provider value={scope}>
        <App />
    </Provider>,
    document.getElementById('root') as HTMLElement
);
