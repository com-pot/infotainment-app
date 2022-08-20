import { App } from "vue";
import { createLocaleController, provideLocaleController } from "./localeController";

export type I18nPluginOptions = {
    availableLocales: string[]
}

export default {
    install(app: App, options: I18nPluginOptions) {
        const localeCtrl = createLocaleController(options)
        provideLocaleController(app, localeCtrl)
    },
}