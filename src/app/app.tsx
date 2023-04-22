import { HopeProvider } from '@hope-ui/solid';
import { Game } from 'widgets/game';
import './app.css';

function App() {
    return (
        <HopeProvider config={{ initialColorMode: 'dark' }}>
            <Game />
        </HopeProvider>
    );
}

export default App;
