import { SoftwaresLists } from '../components/SoftwaresGet';
import { useTranslation } from 'react-i18next';
import { Title, Container, Space } from '@mantine/core';

export default function () {
    const { t, i18n } = useTranslation();

    return (
        <Container
            fluid
            style={{
                // See https://github.com/orgs/mantinedev/discussions/3588
                height: 'calc(90vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))',
            }}
        >
            <Title order={1} ta='center'>
                {t('Software') + ' ' + t('Lists')}
            </Title>
            <Space></Space>
            <SoftwaresLists onlyInstalled={false} onlyUpgradable={false} />
        </Container>
    );
}
