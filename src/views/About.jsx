import { Center, Text, Group, Space } from '@mantine/core';
import { useTranslation } from 'react-i18next';
export default function () {
    const { t } = useTranslation();
    return (
        <>
            <Center style={{ height: '100%', width: '100%' }}>
                <h1>Tinyget UI</h1>
            </Center>
            <h2>{t('Copyright')}</h2>
            <h2>{t('Software') + ' ' + t('Dependencies')}</h2>
            <h2>{t('Authors')}</h2>
            <Text>{'RoyenHeart <royenheart@outlook.com>'}</Text>
        </>
    );
}
