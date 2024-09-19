import { Select } from '@mantine/core';
import { useHotkeys } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector({ i18n }) {
    const { t } = useTranslation();
    const languages = Object.keys(i18n.options.resources);
    if (languages.length === 1) return null;
    const lang = i18n.resolvedLanguage;

    function cycleLang() {
        const currentIndex = languages.indexOf(lang);
        const nextIndex = (currentIndex + 1) % languages.length;
        i18n.changeLanguage(languages[nextIndex]);
    }

    const data = languages.map((supportedLang) => ({
        value: supportedLang,
        label: supportedLang.toUpperCase(),
    }));

    useHotkeys([['mod+Shift+L', cycleLang]]);

    return (
        <Select
            label={t('Switch Language')}
            value={lang}
            onChange={(value) => {
                if (value) i18n.changeLanguage(value);
            }}
            data={data}
        />
    );
}
