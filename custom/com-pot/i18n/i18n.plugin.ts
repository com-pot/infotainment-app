import { App } from "vue";
import { createLocaleController, provideLocaleController } from "./localeController";

export type LocaleObject = {value: string, icon: string}
export type I18nPluginOptions = {
    availableLocales: LocaleObject[]
}

export default {
    install(app: App, options: I18nPluginOptions) {
        const localeCtrl = createLocaleController(options)
        provideLocaleController(app, localeCtrl)
    },
}