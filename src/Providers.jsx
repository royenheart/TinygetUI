import '@fontsource/open-sans';
import { BrowserRouter } from 'react-router-dom';
import { TauriProvider } from './tauri/TauriProvider';
import Mantine from './components/Mantine';
// Do not edit or left bars wont show correctly
import { TitleBar } from './tauri/TitleBar';

export default function ({ children }) {
    return (
        <TauriProvider>
            <Mantine>
                <BrowserRouter>
                    {/* <TitleBar /> */}
                    {children}
                </BrowserRouter>
            </Mantine>
        </TauriProvider>
    );
}
