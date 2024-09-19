import { Flex } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import LanguageHeaders from '../components/LanguageHeaders';

export default function Settings() {
    const { t, i18n } = useTranslation();

    return (
        <Flex mih={50} gap='md' justify='center' align='center' direction='column' wrap='wrap'>
            {/* Switch Language */}
            <LanguageHeaders i18n={i18n} />
        </Flex>
    );
}
