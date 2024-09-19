import { invoke } from '@tauri-apps/api/tauri';
import { notifications } from '@mantine/notifications';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, Flex, Table, Loader, Button, Input, Container, Center } from '@mantine/core';

// Historiers number each page shows
const ITEMS_PER_PAGE = 35;

export function SoftwaresHistories() {
    const [histories, setHistories] = useState([]);
    const [filteredHis, setFilteredHis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [inputPage, setInputPage] = useState(1);
    const { t } = useTranslation();

    useEffect(() => {
        const fetchHis = async () => {
            setLoading(true);
            try {
                const hisLists = await invoke('histories');
                notifications.show({
                    title: 'INFO',
                    message: t('Get softwares histories success'),
                });
                setFilteredHis(hisLists);
                setHistories(hisLists);
            } catch (e) {
                const errMsg = t('Get softwares histories failed: ') + e;
                notifications.show({ title: 'ERROR', message: errMsg });
            }
            setLoading(false);
        };
        fetchHis();
    }, []);

    // Total pages
    const totalPages = Math.ceil(filteredHis.length / ITEMS_PER_PAGE);

    // Get data of current page
    const currentData = filteredHis.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
            ) : histories.length ? (
                <Table.ScrollContainer key={currentPage} style={{ height: '90%', overflowY: 'auto', width: '100%' }}>
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>{t('ID')}</Table.Th>
                                <Table.Th>{t('Command')}</Table.Th>
                                <Table.Th>{t('Date')}</Table.Th>
                                <Table.Th>{t('Operations')}</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {currentData.map((his) => (
                                <Table.Tr key={his.id}>
                                    <Table.Td>{his.id}</Table.Td>
                                    <Table.Td>{his.command}</Table.Td>
                                    <Table.Td>{his.date}</Table.Td>
                                    <Table.Td>{his.operations}</Table.Td>
                                </Table.Tr>
                            ))}
                        </Table.Tbody>
                    </Table>
                </Table.ScrollContainer>
            ) : (
                <Text> {t('No Histories Found!')} </Text>
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
                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    {t('Previous')} {t('Page')}
                </Button>
                <Input
                    value={inputPage}
                    onChange={(e) => setInputPage(Number(e.target.value))}
                    onBlur={() => handlePageChange(inputPage)}
                    style={{
                        marginLeft: '5px',
                        marginRight: '2px',
                        width: 60,
                        textAlign: 'center',
                    }}
                />
                <Button onClick={() => handlePageChange(inputPage)} style={{ marginRight: '5px' }}>
                    {t('Go')}
                </Button>
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    {t('Next')} {t('Page')}
                </Button>
            </Flex>
            <Container size='xs'>
                <Center>
                    {currentPage} / {totalPages}
                </Center>
            </Container>
        </Flex>
    );
}
