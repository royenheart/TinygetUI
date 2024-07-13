import { ColorSchemeScript, MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { useTauriContext } from '../tauri/TauriProvider';
import classes from './Mantine.module.css'
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

/**
 * Override Mantine theme
 * https://mantine.dev/theming/mantine-provider/
 * 
 * @param {*} param0 
 * @returns 
 */
export default function Mantine({ children }) {
    const { scaleFactor, osType } = useTauriContext();
    const theme = createTheme({
        loader: 'oval',
        // Added Segoe UI Variable Text (Win11) to https://mantine.dev/theming/typography/#system-fonts
        fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI Variable Text, Segoe UI, Roboto, Helvetica, Arial, sans-serif, Apple Color Emoji, Segoe UI Emoji',
        fontFamilyMonospace: 'source-code-pro, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace',
        components: {
            Checkbox: { styles: { input: { cursor: 'pointer' }, label: { cursor: 'pointer' } } },
            TextInput: { styles: { label: { marginTop: '0.5rem' } } },
            Select: { styles: { label: { marginTop: '0.5rem' } } },
            Loader: { defaultProps: { size: 'xl' } },
            Space: { defaultProps: { h: 'sm' } },
            Anchor: { defaultProps: { target: '_blank' } },
            Burger: { styles: { burger: { color: '--mantine-color-grey-6' } } },
            SegmentedControl: { classNames: { root: classes.segmentedControlRoot } },
            Center: {
                defaultProps: {
                    w: osType === 'Linux' ? `${1 / scaleFactor}%` : undefined
                }
            }
        },
        // Use colors from v6 (https://v6.mantine.dev/theming/colors/#default-colors)
        colors: {
            dark: ['#C1C2C5', '#A6A7AB', '#909296', '#5c5f66', '#373A40', '#2C2E33', '#25262b', '#1A1B1E', '#141517', '#101113']
        }
    });

    const cssVariablesResolver = () => ({
        variables: {},
        light: {},
        dark: {}
    });

    return <>
        <ColorSchemeScript defaultColorScheme='auto' />
        <MantineProvider defaultColorScheme='auto' theme={theme} cssVariablesResolver={cssVariablesResolver}>
            <ModalsProvider>
                <Notifications />
                {children}
            </ModalsProvider>
        </MantineProvider>
    </>
}
