import { invoke } from '@tauri-apps/api/tauri';
import { notifications } from '@mantine/notifications';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Text,
    Button,
    Input,
    TextInput,
    Flex,
    Container,
    Center,
    Title,
    Accordion,
    Loader,
    Group,
} from '@mantine/core';
import { IoSearchCircle } from 'react-icons/io5';

// Softwares number each page shows
const ITEMS_PER_PAGE = 20;

export function SoftwaresLists({ onlyInstalled = false, onlyUpgradable = false, pkgs = '' }) {
    const [softs, setSofts] = useState([]);
    const [filteredSofts, setFilteredSofts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isTrigger, setIsTrigger] = useState(false);
    const { t } = useTranslation();

    const SoftwaresInstall = (pkgs) => {
        invoke('install', { pkgs: pkgs })
            .then((response) => {
                notifications.show({ title: 'INFO', message: t('Install softwares success') + response });
                setIsTrigger(!isTrigger);
            })
            .catch((error) => {
                notifications.show({ title: 'ERROR', message: t('Install softwares failed: ') + error });
            });
    };

    const SoftwaresUninstall = (pkgs) => {
        invoke('uninstall', { pkgs: pkgs })
            .then((response) => {
                notifications.show({ title: 'INFO', message: t('Uninstall softwares success') + response });
                setIsTrigger(!isTrigger);
            })
            .catch((error) => {
                notifications.show({ title: 'ERROR', message: t('Uninstall softwares failed: ') + error });
            });
    };

    useEffect(() => {
        const fetchSofts = async () => {
            setLoading(true);
            try {
                const softLists = await invoke('list', {
                    onlyInstalled: onlyInstalled,
                    onlyUpgradable: onlyUpgradable,
                    pkgs: pkgs,
                });
                notifications.show({
                    title: 'INFO',
                    message: t('Get softwares list success'),
                });
                setInputPage(1);
                setSofts(softLists);
                searchSoftsF(softLists);
            } catch (e) {
                const errMsg = t('Get softwares list failed: ') + e;
                notifications.show({ title: 'ERROR', message: errMsg });
                setSofts([]);
                setFilteredSofts([]);
            }
            setLoading(false);
        };
        fetchSofts();
    }, [isTrigger]);

    const searchSoftsF = (softLists = null) => {
        const term = searchTerm.toLowerCase();
        if (term.length === 0) {
            if (softLists !== null) {
                setFilteredSofts(softLists);
            } else {
                setFilteredSofts(softs);
            }
        } else {
            if (softLists !== null) {
                setFilteredSofts(softLists.filter((soft) => soft.package_name.toLowerCase().includes(term)));
            } else {
                setFilteredSofts(softs.filter((soft) => soft.package_name.toLowerCase().includes(term)));
            }
        }
        setCurrentPage(1);
    };

    // search packages
    const handleSearch = (event) => {
        if (event.key === 'Enter') {
            searchSoftsF();
        }
    };

    // Total pages
    // 0 -> 1
    const totalPages = Math.ceil(filteredSofts.length / ITEMS_PER_PAGE);

    // Get data of current page
    const currentData = filteredSofts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    // Handle page change
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            setInputPage(newPage);
        }
    };

    return (
        <Flex
            mih={50}
            bg='rgba(0, 0, 0, .0)'
            gap='xs'
            justify='center'
            align='center'
            direction='column'
            wrap='nowrap'
            style={{
                height: '100%',
                border: '1px ridge',
                paddingBottom: '5px',
            }}
        >
            {loading ? (
                // Loading
                <Loader color='blue' />
            ) : filteredSofts.length ? (
                <>
                    {/* Use accordion to show softwares page */}
                    <Accordion
                        key={currentPage}
                        style={{
                            width: '100%',
                            height: '90%',
                            overflowY: 'auto',
                            borderBottom: '1px ridge',
                        }}
                    >
                        {currentData.map((soft) => (
                            <Accordion.Item
                                key={soft.package_name + '-' + soft.architecture}
                                value={soft.package_name + '-' + soft.architecture}
                            >
                                <Accordion.Control>
                                    <Flex gap='xl' justify='flex-start' align='center' direction='row' wrap='wrap'>
                                        <Container style={{ width: '60%' }}>
                                            <Title order={2}>
                                                {t('Software')}: {soft.package_name}
                                            </Title>
                                            <Text>
                                                {t('Desc')}: {soft.description}
                                            </Text>
                                        </Container>
                                        <Group justify='center' style={{ width: '35%' }}>
                                            {soft.installed ? (
                                                <Button
                                                    onClick={() => {
                                                        notifications.show({
                                                            title: 'INFO',
                                                            message: soft.package_name + ' ' + t('Uninstalling'),
                                                        });
                                                        SoftwaresUninstall([soft.package_name]);
                                                    }}
                                                >
                                                    {t('Uninstall')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => {
                                                        notifications.show({
                                                            title: 'INFO',
                                                            message: soft.package_name + ' ' + t('Installing'),
                                                        });
                                                        SoftwaresInstall([soft.package_name]);
                                                    }}
                                                >
                                                    {t('Install')}
                                                </Button>
                                            )}
                                            {soft.upgradable && (
                                                <Button
                                                    onClick={() => {
                                                        notifications.show({
                                                            title: 'INFO',
                                                            message: soft.package_name + ' ' + t('Upgrade'),
                                                        });
                                                        SoftwaresInstall([soft.package_name]);
                                                    }}
                                                >
                                                    {t('Upgrade')}
                                                </Button>
                                            )}
                                        </Group>
                                    </Flex>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Text>
                                        {t('Arch')}: {soft.architecture}
                                    </Text>
                                    <Text>
                                        {t('Version')}: {soft.version}
                                    </Text>
                                    <Text>
                                        {t('Installed')}: {t(String(soft.installed))}
                                    </Text>
                                    <Text>
                                        {t('Automatically Installed')}: {t(String(soft.automatically_installed))}
                                    </Text>
                                    <Text>
                                        {t('Upgradable')}: {t(String(soft.upgradable))}
                                    </Text>
                                    {soft.available_version === null ? (
                                        <Text>{t('No available version found')}</Text>
                                    ) : (
                                        <Text>
                                            {t('Available Version')}: {soft.available_version}
                                        </Text>
                                    )}
                                    <Text>
                                        {t('Repos')}: {String(soft.repo)}
                                    </Text>
                                </Accordion.Panel>
                            </Accordion.Item>
                        ))}
                    </Accordion>
                </>
            ) : (
                <Text> {t('No Software Found!')} </Text>
            )}

            {/* Page P */}
            <Flex
                mih={50}
                gap='xs'
                justify='center'
                align='center'
                direction='row'
                wrap='wrap'
                style={{ width: '100%' }}
            >
                <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1 || loading === true}
                >
                    {t('Previous')} {t('Page')}
                </Button>
                <Input
                    value={inputPage}
                    onChange={(e) => setInputPage(Number(e.target.value.replace(/\D/g, '')))}
                    onBlur={() => handlePageChange(inputPage)}
                    style={{
                        marginLeft: '5px',
                        marginRight: '2px',
                        width: 60,
                        textAlign: 'center',
                    }}
                    disabled={totalPages <= 0 || loading === true}
                />
                <Button
                    onClick={() => handlePageChange(inputPage)}
                    style={{ marginRight: '5px' }}
                    disabled={inputPage > totalPages || loading === true}
                >
                    {t('Go')}
                </Button>
                <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages || loading === true}
                >
                    {t('Next')} {t('Page')}
                </Button>
            </Flex>
            <Container size='xs'>
                <Center>
                    {currentPage} / {totalPages}
                </Center>
            </Container>

            {/* Search softwares */}
            <TextInput
                icon={<IoSearchCircle />}
                placeholder={t('Search') + ' ' + t('Softwares')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearch}
                size='sm'
                disabled={loading === true}
            />
        </Flex>
    );
}
