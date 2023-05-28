import { App, inject, reactive } from "vue"
import { I18nPluginOptions } from "./i18n.plugin"

export function createLocaleController(opts: I18nPluginOptions) {
    return reactive({
        opts,

        activeLocale: opts.availableLocales[0].value,

        cycleLocale() {
            const iActive = opts.availableLocales.findIndex((locale) => locale.value === this.activeLocale)
            const next = (iActive + 1) % opts.availableLocales.length
            this.activeLocale = opts.availableLocales[next].value
        },
    })
}
export const localeControllerInjectionKey = Symbol('i18n controller')
export function provideLocaleController(app: App, ctrl: LocaleController) {
    app.provide(localeControllerInjectionKey, ctrl)
}
export const useLocaleController = () => inject<LocaleController>(localeControllerInjectionKey)
export type LocaleController = ReturnType<typeof createLocaleController>