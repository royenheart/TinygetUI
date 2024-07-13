import '@fontsource/open-sans';
import { BrowserRouter } from 'react-router-dom';
import { TauriProvider } from './tauri/TauriProvider';
import Mantine from './components/Mantine';
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
