import { Anchor, Text } from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { Fragment } from "react";

// when many languages are supported, a dropdown (Select) may be optimal
export default function LanguageHeaders({ i18n }) {
    const languages = Object.keys(i18n.options.resources);
    if (languages.length == 1) return <></>;
    const lang = i18n.resolvedLanguage;
    let nextLangIdx = 0;

    function cycleLang() {
        if (nextLangIdx == languages.length) nextLangIdx = 0;
        i18n.changeLanguage(languages[nextLangIdx]);
    }

    // Render Language Switches
    const header = languages.map((supportedLang, index) => {
        const selectedLang = lang === supportedLang;
        if (selectedLang) nextLangIdx = index + 1;
        return <Fragment key={index}>
            {
                selectedLang ?
                    <Text>{supportedLang.toUpperCase()}</Text> :
                    <Anchor onClick={
                        () => i18n.changeLanguage(supportedLang)
                    }>
                        {supportedLang.toUpperCase()}
                    </Anchor>
            }
            {/* <Text>{index < languages.length - 1 && '|'}</Text> */}
        </Fragment>;
    });
    // ctrl + shift + L
    useHotkeys([['mod+Shift+L', cycleLang]]);
    return header;
}
