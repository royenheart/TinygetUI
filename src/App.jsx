import {
    ActionIcon,
    AppShell,
    AppShellHeader,
    AppShellMain,
    AppShellNavbar,
    AppShellSection,
    Burger,
    Button,
    Flex,
    Group,
    Loader,
    Text,
    useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { relaunch } from '@tauri-apps/api/process';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { appWindow } from '@tauri-apps/api/window';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsMoonStarsFill } from 'react-icons/bs';
import { IoSunnySharp } from 'react-icons/io5';
import { FaWindowClose } from 'react-icons/fa';
import { GrUpdate } from 'react-icons/gr';
import { MdUpgrade } from 'react-icons/md';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from 'react-icons/ai';
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useCookie } from './common/utils';
import { RUNNING_IN_TAURI, useTauriContext } from './tauri/TauriProvider';
import classes from './App.module.css';
import SimpleBar from 'simplebar-react';
import { TerminalComponent } from './views/Logs';
import Install from './views/Install';
import Installed from './views/Installed';
import Update from './views/Update';
import About from './views/About';
import Settings from './views/Settings';
import MirrorHelp from './views/MirrorHelp';
import Histories from './views/Histories';
import * as tauriEvent from '@tauri-apps/api/event';
import 'simplebar-react/dist/simplebar.min.css';
import globalEnv from './env';
import { invoke } from '@tauri-apps/api/tauri';

var fullScreen = false;
const toggleFullscreen = () => {
    appWindow.isFullscreen().then((x) => {
        fullScreen = !x;
        appWindow.setFullscreen(!x);
    });
};

const hideWindow = () => {
    appWindow.hide();
};

const loaderComponent = (
    <Flex mih={50} gap='md' justify='center' align='center' direction='column' wrap='wrap' style={{ height: '90vh' }}>
        <Loader color='blue'></Loader>
    </Flex>
);

export default function () {
    const { t } = useTranslation();
    const { usingCustomTitleBar } = useTauriContext();
    // Software Updating
    const [updating, setUpdating] = useState(false);
    // Software Upgrading
    const [upgrading, setUpgrading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    const updateSoftwares = () => {
        setUpdating(true);
        notifications.show({ title: 'INFO', message: t('Start updating softwares') });
        invoke('update', { upgrade: false })
            .then((resp) => {
                notifications.show({ title: 'INFO', message: t('Update softwares success') });
            })
            .catch((error) => {
                notifications.show({ title: 'ERROR', message: t('Update softwares failed: ') + error });
            })
            .finally(() => {
                setUpdating(false);
            });
    };

    const upgradeSoftwares = () => {
        setUpgrading(true);
        notifications.show({ title: 'INFO', message: t('Start upgrading softwares') });
        invoke('update', { upgrade: true })
            .then((resp) => {
                notifications.show({ title: 'INFO', message: t('Upgrade softwares success') });
            })
            .catch((error) => {
                notifications.show({ title: 'ERROR', message: t('Upgrade softwares failed: ') + error });
            })
            .finally(() => {
                setUpgrading(false);
            });
    };

    // Navlink objs
    const views = [
        { component: Install, path: '/install', name: t('Install') },
        { component: Update, path: '/update', name: t('Update') },
        { component: Installed, path: '/installed', name: t('Installed') },
        { component: Histories, path: '/histories', name: t('Histories') },
        { component: TerminalComponent, path: '/logs', name: t('Server Logs') },
        { component: MirrorHelp, path: '/mirrorhelp', name: t('Mirror Helps') },
        { component: About, path: '/about', name: t('About') },
        { component: Settings, path: '/settings', name: t('Settings') },
    ];

    // Color scheme switch functions
    const { toggleColorScheme, colorScheme } = useMantineColorScheme();

    // Set key bindings
    useHotkeys([
        ['ctrl+J', toggleColorScheme],
        ['ctrl+F', toggleFullscreen],
    ]);

    // Opend for NavLink
    const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();
    const [desktopNavOpened, setDesktopNavOpened] = useCookie('desktop-nav-opened', true);
    const toggleDesktopNav = () => setDesktopNavOpened((o) => !o);

    // Updater integration
    function startInstall(newVersion) {
        notifications.show({
            title: t('Installing update v{{ v }}', { v: newVersion }),
            message: t('Will relaunch afterwards'),
            autoClose: false,
        });
        installUpdate().then(relaunch);
    }

    // Tauri event listeners (run on mount)
    if (RUNNING_IN_TAURI) {
        // system tray events, events will send payload
        useEffect(() => {
            const promise = tauriEvent.listen('systemTray', ({ payload, ...eventObj }) => {
                // for debugging purposes only
                console.log('System tray event: ' + payload.message);
            });
            // disable listen when component offload (The father component)
            return () => promise.then((unlisten) => unlisten());
        }, []);

        // update checker
        useEffect(() => {
            checkUpdate().then(({ shouldUpdate, manifest }) => {
                if (shouldUpdate) {
                    const { version: newVersion, body: releaseNotes } = manifest;
                    const color = colorScheme === 'dark' ? 'teal' : 'teal.8';
                    notifications.show({
                        title: t('Update v{{ v }} available', {
                            v: newVersion,
                        }),
                        color,
                        message: (
                            <>
                                <Text>{releaseNotes}</Text>
                                <Button
                                    color={color}
                                    style={{ width: '100%' }}
                                    onClick={() => startInstall(newVersion)}
                                >
                                    {t('Install update and relaunch')}
                                </Button>
                            </>
                        ),
                        autoClose: false,
                    });
                }
            });
        }, []);

        // Handle additional app launches (url, etc.)
        useEffect(() => {
            const promise = tauriEvent.listen('newInstance', async ({ payload, ...eventObj }) => {
                if (!(await appWindow.isVisible())) await appWindow.show();

                if (await appWindow.isMinimized()) {
                    await appWindow.unminimize();
                    await appWindow.setFocus(true);
                }

                let args = payload?.args;
                let cwd = payload?.cwd;
                if (args?.length > 1) {
                }
            });
            return () => promise.then((unlisten) => unlisten());
        }, []);
    }

    // Render Navlinks
    function NavLinks() {
        return views.map((view, index) => (
            <NavLink
                align='left'
                to={view.path}
                key={index}
                end={view.exact}
                onClick={() => toggleMobileNav(false)}
                className={({ isActive }) =>
                    classes.navLink + ' ' + (isActive ? classes.navLinkActive : classes.navLinkInactive)
                }
            >
                <Text>{t(view.name)}</Text>
            </NavLink>
        ));
    }

    const scrollbarRef = useRef();

    // hack for global styling the vertical simplebar based on state
    useEffect(() => {
        const el = document.getElementsByClassName('simplebar-vertical')[0];
        if (el !== undefined) {
            el.style.marginTop = usingCustomTitleBar ? '100px' : '70px';
            el.style.marginBottom = 0;
        }
    }, [usingCustomTitleBar]);

    useEffect(() => {
        const tsstatus = tauriEvent.listen('tinygetServerStatus', ({ payload, ...eventObj }) => {
            if (payload.alive === true) {
                if (globalEnv.isTerminalInitialized !== true) {
                    globalEnv.isTerminalInitialized = true;
                    setIsInitialized(true);
                }
            } else {
                if (globalEnv.isTerminalInitialized !== false) {
                    globalEnv.isTerminalInitialized = false;
                    setIsInitialized(false);
                }
                if (payload.retcode === -99) {
                    notifications.show({ title: 'WARN', message: 'Waiting Tinyget server fully opened' });
                } else {
                    notifications.show({ title: 'WARN', message: 'Tinyget Server Stop: ' + payload.retcode });
                }
            }
        });
        return () => tsstatus.then((unlisten) => unlisten());
    }, []);

    return isInitialized ? (
        <SimpleBar scrollableNodeProps={{ ref: scrollbarRef }} autoHide={false} className={classes.simpleBar}>
            <AppShell
                // set views' configurations and apply
                padding='md'
                header={{ height: 60 }}
                navbar={{
                    width: 200,
                    breakpoint: 'sm',
                    collapsed: {
                        mobile: !mobileNavOpened,
                        desktop: !desktopNavOpened,
                    },
                }}
                className={classes.appShell}
            >
                {/* Main Contents */}
                <AppShellMain>
                    <Routes>
                        <Route exact path='/' element={<Navigate to={views[0].path} />} />
                        {views.map((view, index) => (
                            <Route key={index} exact={view.exact} path={view.path} element={<view.component />} />
                        ))}
                    </Routes>
                </AppShellMain>

                {/* Header */}
                <AppShellHeader data-tauri-drag-region p='md' className={classes.header}>
                    {/* Switch Desktop/Mobile NavLink */}
                    <Group h='100%'>
                        <Burger hiddenFrom='sm' opened={mobileNavOpened} onClick={toggleMobileNav} size='sm' />
                        <Burger visibleFrom='sm' opened={desktopNavOpened} onClick={toggleDesktopNav} size='sm' />
                    </Group>
                    <Group className={classes.headerRightItems} h='110%'>
                        {/* Update Softwares */}
                        <ActionIcon
                            id='update-softwares'
                            variant='default'
                            onClick={updateSoftwares}
                            size={30}
                            className={updating ? classes.rotating : ''}
                        >
                            {
                                // Update softwares
                                <GrUpdate size={'1.5em'} />
                            }
                        </ActionIcon>
                        {/* Upgrade Softwares */}
                        <ActionIcon
                            id='upgrade-softwares'
                            variant='default'
                            onClick={upgradeSoftwares}
                            size={30}
                            className={upgrading ? classes.moving : ''}
                        >
                            {
                                // Upgrade softwares
                                <MdUpgrade size={'1.5em'} />
                            }
                        </ActionIcon>
                        {/* Hide Window */}
                        <ActionIcon id='hide-window' variant='default' onClick={hideWindow} size={30}>
                            {
                                // Hide Window
                                <FaWindowClose size={'1.5em'} />
                            }
                        </ActionIcon>
                        {/* Switch Themes */}
                        <ActionIcon
                            id='toggle-theme'
                            title='Ctrl + J'
                            variant='default'
                            onClick={toggleColorScheme}
                            size={30}
                        >
                            {
                                // Swicth Themes Icon
                                colorScheme === 'dark' ? <IoSunnySharp size={'1.5em'} /> : <BsMoonStarsFill />
                            }
                        </ActionIcon>
                        {/* Switch Fullscreen */}
                        <ActionIcon
                            id='toggle-fullscreen'
                            title='Ctrl + F'
                            variant='default'
                            onClick={toggleFullscreen}
                            size={30}
                        >
                            {fullScreen ? <AiOutlineFullscreenExit size={'1.5em'} /> : <AiOutlineFullscreen />}
                        </ActionIcon>
                    </Group>
                </AppShellHeader>

                {/* Navbar */}
                <AppShellNavbar
                    className={classes.titleBarAdjustedHeight}
                    height='100%'
                    width={{ sm: 200 }}
                    p='xs'
                    hidden={!mobileNavOpened}
                >
                    <AppShellSection grow>
                        <NavLinks />
                    </AppShellSection>
                </AppShellNavbar>
            </AppShell>
        </SimpleBar>
    ) : (
        loaderComponent
    );
}
