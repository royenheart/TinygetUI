import { ActionIcon, AppShell, AppShellAside, TextInput, AppShellHeader, AppShellMain, AppShellNavbar, AppShellSection, Burger, Button, Group, Space, Text, useComputedColorScheme, useMantineColorScheme } from '@mantine/core';
import { useDisclosure, useHotkeys } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { relaunch } from '@tauri-apps/api/process';
import { checkUpdate, installUpdate } from '@tauri-apps/api/updater';
import { appWindow } from '@tauri-apps/api/window';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BsMoonStarsFill } from 'react-icons/bs';
import { IoSunnySharp, IoSearchCircle } from 'react-icons/io5';
import { AiOutlineFullscreen, AiOutlineFullscreenExit } from "react-icons/ai";
import { NavLink, Navigate, Route, Routes } from 'react-router-dom';
import { useCookie } from './common/utils';
import { ScrollToTop } from './components/ScrollToTop';
import { RUNNING_IN_TAURI, useTauriContext } from './tauri/TauriProvider';
import classes from './App.module.css';
import SimpleBar from 'simplebar-react';
import Logs from './views/Logs';
import Sources from './views/Sources';
import Install from './views/Install';
import Installed from './views/Installed';
import Update from './views/Update';
import About from './views/About';
import Settings from './views/Settings';
import * as tauriEvent from '@tauri-apps/api/event';
import 'simplebar-react/dist/simplebar.min.css';

var fullScreen = false
const toggleFullscreen = () => {
  appWindow.isFullscreen().then(x => {
    fullScreen = !x;
    appWindow.setFullscreen(!x);
  });
};

export default function () {
  const { t } = useTranslation();
  const { usingCustomTitleBar } = useTauriContext();

  // Navlink objs
  const views = [
    // Suspense example when a component was lazy loaded
    //     { component: () => <React.Suspense fallback={<Fallback />}><Setting /></React.Suspense>, path: '/settings', name: t('Settings') },
    { component: Install, path: '/install', name: t('Install') },
    { component: Update, path: '/update', name: t('Update') },
    { component: Installed, path: '/installed', name: t('Installed') },
    { component: About, path: '/about', name: t('About') },
    { component: Sources, path: '/sources', name: t('Sources') },
    { component: Logs, path: '/logs', name: t('Logs') },
    { component: Settings, path: '/settings', name: t('Settings') },
  ];

  // Color scheme switch functions
  const { toggleColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme();

  // Set key bindings
  useHotkeys([
    ['ctrl+J', toggleColorScheme],
    ['ctrl+F', toggleFullscreen]]
  );

  // Opend for NavLink
  const [mobileNavOpened, { toggle: toggleMobileNav }] = useDisclosure();
  const [desktopNavOpened, setDesktopNavOpened] = useCookie('desktop-nav-opened', true);
  const toggleDesktopNav = () => setDesktopNavOpened(o => !o);

  // const [navbarClearance, setNavbarClearance] = useState(0);

  // Updater integration
  function startInstall(newVersion) {
    notifications.show({ title: t('Installing update v{{ v }}', { v: newVersion }), message: t('Will relaunch afterwards'), autoClose: false });
    installUpdate().then(relaunch);
  }

  // Tauri event listeners (run on mount)
  if (RUNNING_IN_TAURI) {
    useEffect(() => {
      const promise = tauriEvent.listen('longRunningThread', ({ payload }) => {
        console.log(payload.message);
      });
      return () => promise.then(unlisten => unlisten());
    }, []);
    // system tray events
    useEffect(() => {
      const promise = tauriEvent.listen('systemTray', ({ payload, ...eventObj }) => {
        console.log(payload.message);
        // for debugging purposes only
        notifications.show({
          title: '[DEBUG] System Tray Event',
          message: payload.message
        });
      });
      return () => promise.then(unlisten => unlisten());
    }, []);

    // update checker
    useEffect(() => {
      checkUpdate().then(({ shouldUpdate, manifest }) => {
        if (shouldUpdate) {
          const { version: newVersion, body: releaseNotes } = manifest;
          const color = colorScheme === 'dark' ? 'teal' : 'teal.8';
          notifications.show({
            title: t('Update v{{ v }} available', { v: newVersion }),
            color,
            message: <>
              <Text>{releaseNotes}</Text>
              <Button color={color} style={{ width: '100%' }} onClick={() => startInstall(newVersion)}>{t('Install update and relaunch')}</Button>
            </>,
            autoClose: false
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
      return () => promise.then(unlisten => unlisten());
    }, []);
  }

  // Render Navlinks
  function NavLinks() {
    return views.map((view, index) =>
      <NavLink align='left' to={view.path} key={index}
        end={view.exact}
        onClick={() => toggleMobileNav(false)}
        className={({ isActive }) =>
          classes.navLink + ' ' +
          (isActive ? classes.navLinkActive : classes.navLinkInactive)
        }
      >
        <Text>{view.name}</Text>
      </NavLink>
    );
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

  return (
    <>
      <SimpleBar scrollableNodeProps={{ ref: scrollbarRef }} autoHide={false} className={classes.simpleBar}>
        <AppShell
          // set views' configurations and apply
          padding='md'
          header={{ height: 60 }}
          navbar={{
            width: 200, breakpoint: 'sm',
            collapsed: {
              mobile: !mobileNavOpened,
              desktop: !desktopNavOpened
            }
          }}
          // aside={{
          //   width: 150, breakpoint: 'sm',
          //   collapsed: {
          //     desktop: false,
          //     mobile: true
          //   }
          // }}
          className={classes.appShell}
        >
          {/* Main Contents */}
          <AppShellMain>
            {/* {usingCustomTitleBar && <Space h='xl' />} */}
            <Routes>
              <Route exact path='/' element={
                <Navigate to={views[0].path} />
              } />
              {
                views.map((view, index) =>
                  <Route key={index} exact={view.exact}
                    path={view.path}
                    element={
                      <view.component />
                    } />
                )
              }
            </Routes>
            <ScrollToTop scroller={scrollbarRef.current} bottom={10} />
          </AppShellMain>

          {/* Header */}
          <AppShellHeader data-tauri-drag-region p='md' className={classes.header}>
            {/* Switch Desktop/Mobile NavLink */}
            <Group h='100%'>
              <Burger hiddenFrom='sm' opened={mobileNavOpened} onClick={toggleMobileNav} size='sm' />
              <Burger visibleFrom='sm' opened={desktopNavOpened} onClick={toggleDesktopNav} size='sm' />
            </Group>
            <TextInput icon={<IoSearchCircle />} placeholder={t('Search') + ' ' + t('Softwares')} size='sm' />
            <Group className={classes.headerRightItems} h='110%'>
              {/* Switch Themes */}
              <ActionIcon id='toggle-theme'
                title='Ctrl + J'
                variant='default'
                onClick={toggleColorScheme}
                size={30}
              >
                {
                  // Swicth Themes Icon
                  colorScheme === 'dark' ?
                    <IoSunnySharp size={'1.5em'} /> :
                    <BsMoonStarsFill />
                }
              </ActionIcon>
              {/* Switch Fullscreen */}
              <ActionIcon id='toggle-fullscreen'
                title='Ctrl + F'
                variant='default'
                onClick={toggleFullscreen}
                size={30}
              >
                {
                  fullScreen ? <AiOutlineFullscreenExit size={'1.5em'} /> : <AiOutlineFullscreen />
                }
              </ActionIcon>
            </Group>
          </AppShellHeader>

          {/* Navbar */}
          <AppShellNavbar
            className={classes.titleBarAdjustedHeight}
            height='100%'
            width={{ sm: 200 }}
            p='xs' hidden={!mobileNavOpened}
          >
            <AppShellSection grow><NavLinks /></AppShellSection>
          </AppShellNavbar>

          {/* Softwares Detailed Interface (Right Sidebar) */}
          {/* <AppShellAside className={classes.titleBarAdjustedHeight}
            hidden={!mobileNavOpened} p='md'
            width={{ sm: 200, lg: 300 }}
          >
            <Text>Softwares Detailed Interface</Text>
          </AppShellAside> */}
        </AppShell>
      </SimpleBar>
    </>
  );
}
