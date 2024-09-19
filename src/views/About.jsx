import { Text, Flex, Title, Container, Space } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export default function () {
    const { t } = useTranslation();
    return (
        <Flex mih={50} gap='lg' justify='center' align='center' direction='column' wrap='nowrap'>
            <Title order={1}>Tinyget UI</Title>
            <Container align='center'>
                <Title order={2}>{t('License')}</Title>
                <Space></Space>
                <Text>{'GPL-2.0-or-later'}</Text>
            </Container>
            <Container align='center'>
                <Title order={2}>{t('Authors')}</Title>
                <Space></Space>
                <Text>{'RoyenHeart <royenheart@outlook.com>'}</Text>
            </Container>
            <Container align='center'>
                <Title order={2}>
                    {t('Project')} {t('Brief')}
                </Title>
                <Space></Space>
                <Text>
                    {t(
                        'This is a Python package management tool, handling mainstream system package managers such as apt (used in Debian, Ubuntu, etc.), dnf (used in Fedora, CentOS, etc.) and pacman (used in ArchLinux, etc.).'
                    )}
                </Text>
                <Text>
                    {t(
                        'This library encapsulates the core operations of various package managers, allowing you to interact with them through a unified interface and format.'
                    )}
                </Text>
            </Container>
            <Container align='center'>
                <Title order={2}>{t('Security Statement')}</Title>
                <Space></Space>
                <Text>
                    {t(
                        'By default, tinyget invokes the system package manager and official package build programs to perform software updates, installations, and other operations, without calling any additional executable files.'
                    )}
                </Text>
            </Container>
            <Container align='center'>
                <Title order={2}>{t('Disclaimer')}</Title>
                <Space></Space>
                <Text>
                    {t(
                        'For commercial software included in third-party packages, their intellectual property rights are owned by the respective companies. tinyget only provides official download links and performs downloads and installations from those links, and in principle does not make modifications.'
                    )}
                </Text>
            </Container>
        </Flex>
    );
}
