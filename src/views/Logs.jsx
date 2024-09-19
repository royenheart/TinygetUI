import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { invoke } from '@tauri-apps/api/tauri';
import { Container, Space, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import globalEnv from '../env';

// Terminal Instance
const term = new Terminal({
    fontFamily: 'Roboto Mono',
    theme: {
        background: 'rgb(47, 47, 47)',
    },
    // disable user input, only show tinyget's log
    disableStdin: true,
});

const fitAddon = new FitAddon();

export function TerminalComponent() {
    const { t, i18n } = useTranslation();
    const terminalRef = useRef(null);
    const animationFrameIdRef = useRef(null);

    useEffect(() => {
        const terminalElement = terminalRef.current;
        term.loadAddon(fitAddon);

        if (globalEnv.isTerminalInitialized === true) {
            async function readFromPty() {
                const data = await invoke('async_read_from_pty');
                if (data) {
                    term.write(data);
                }
                animationFrameIdRef.current = window.requestAnimationFrame(readFromPty);
            }

            animationFrameIdRef.current = window.requestAnimationFrame(readFromPty);
        }

        // Attach to DOM
        term.open(terminalElement);
        fitAddon.fit();

        async function fitTerminal() {
            fitAddon.fit();
            await invoke('async_resize_pty', {
                rows: term.rows,
                cols: term.cols,
            });
        }

        window.addEventListener('resize', fitTerminal);
        fitTerminal();

        // unload
        return () => {
            // Detach terminal from DOM without destrying it
            if (terminalElement && terminalElement.children.length > 0) {
                terminalElement.removeChild(terminalElement.children[0]);
            }
            window.removeEventListener('resize', fitTerminal);
            if (animationFrameIdRef.current) {
                window.cancelAnimationFrame(animationFrameIdRef.current);
            }
        };
    }, []);

    return (
        <Container fluid ta='center'>
            <Title order={1}>{t('Server logs')}</Title>
            <Space></Space>
            <Container
                fluid
                id='terminal'
                ref={terminalRef}
                style={{
                    height: 'calc(90vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))',
                    textAlign: 'left',
                }}
            />
        </Container>
    );
}
