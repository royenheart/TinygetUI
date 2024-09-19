import { SoftwaresHistories } from '../components/SoftwaresHistory';
import { useTranslation } from 'react-i18next';
import { Title, Container, Space } from '@mantine/core';

export default function () {
    const { t, i18n } = useTranslation();

    return (
        <Container
            fluid
            style={{
                height: 'calc(90vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))',
            }}
        >
            <Title order={1} ta='center'>
                {t('Operations Histories')}
            </Title>
            <Space></Space>
            <SoftwaresHistories />
        </Container>
    );
}
