import { HopeProvider } from '@hope-ui/solid';
import { Game } from 'pages/game';
// import { Balls } from 'pages/balls';
import './app.css';

function App() {
    return (
        <HopeProvider config={{ initialColorMode: 'dark' }}>
            <Game />
            {/*<Balls />*/}
        </HopeProvider>
    );
}

export default App;
