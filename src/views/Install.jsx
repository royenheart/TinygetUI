import { useTranslation } from 'react-i18next';
import { Text, Group, Button } from '@mantine/core';
import { SoftwaresLists } from '../components/SoftwaresLists';
import React, { useState, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import classes from './Install.module.css';

export default function () {
    const { t } = useTranslation();
    const [softs, setSofts] = useState(null);
    const [expandedSoftware, setExpandedSoftware] = useState(null);

    useEffect(() => {
        const fetchSofts = async () => {
            setSofts(await SoftwaresLists());
        };
        fetchSofts();
    }, []);

    const toggleSoftwareDetails = (index) => {
        setExpandedSoftware(expandedSoftware === index ? null : index);
    };

    return (
        <div>
            <h1>{t('Software') + ' ' + t('Lists')}</h1>
            <div className={classes.softwareList}>
                {
                    softs ? softs.map((soft, index) => (
                        <div
                            key={index}
                            className={classes.softwareItem}
                        >
                            <div className={classes.softwareIntro}>
                                <div onClick={() => toggleSoftwareDetails(index)} className={classes.softwareIntroDis}>
                                    <h2>{t('Software')}: {soft.name}</h2>
                                    <p>{t('Brief')}: {soft.brief}</p>
                                    <p>{t('Author')}: {soft.author}</p>
                                </div>
                                <div className={classes.softwareOperations}>
                                    <Button onClick={
                                        () => notifications.show({ title: 'INFO', message: soft.name + ' ' + t('Installing') })
                                    }>
                                        {t('Install')}
                                    </Button>
                                </div>
                            </div>
                            {
                                expandedSoftware === index && (
                                    <div className={classes.softwareDetails}>
                                        <p>{t('Description')}: {soft.desc}</p>
                                        <p>{t('Version')}: {soft.curr_version}</p>
                                    </div>
                                )
                            }
                        </div>
                    )) : <Text> No Software Found! </Text>
                }
            </div>
        </div >
    );
}
