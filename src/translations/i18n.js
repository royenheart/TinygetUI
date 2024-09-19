import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import zh_CN from './zh_CN.json';

export const defaultLng = 'en';
const resources = {
    English: {
        translations: en,
    },
    中文: {
        translations: zh_CN,
    },
};

i18n.use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: defaultLng,
        debug: false,

        ns: ['translations'],
        defaultNS: 'translations',

        keySeparator: false,

        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
