import { Container, Title, Loader, Space } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function () {
    const { t } = useTranslation();
    const [isLoading, setIsLoading] = useState(true);

    const handleIframeLoad = () => {
        setIsLoading(false);
    };

    return (
        <Container
            fluid
            ta='center'
            style={{
                height: 'calc(90vh - var(--app-shell-header-height, 0px) - var(--app-shell-footer-height, 0px))',
            }}
        >
            <Title order={1}>{t('Mirror help from mirrorz')}</Title>
            <Space></Space>
            {isLoading && (
                <Loader
                    color='blue'
                    bg='rgba(0, 0, 0, 0.0)'
                    style={{
                        top: '20%',
                        zIndex: 10,
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        color: '#fff',
                    }}
                />
            )}
            <iframe
                src='https://mirrors.help/'
                title='Mirror help from mirrorz'
                onLoad={handleIframeLoad}
                style={{ width: '100%', border: 'none', height: '100%' }}
            ></iframe>
        </Container>
    );
}
