import { LocaleController, useLocaleController } from "@custom/com-pot/i18n/localeController"
import { Localized } from "@typeful/model/types/I18n"
import { computed } from "vue"

const rendererCache = new WeakMap()
const noController = {s: 'no locale'}

export function useRender(): ReturnType<typeof createRender> {
    const localeController = useLocaleController()
    const key = localeController || noController
    if (!rendererCache.has(key)) {
        rendererCache.set(key, createRender(localeController))
    }
    return rendererCache.get(key)
}

function createRender(localeCtrl?: LocaleController) {
    const locale = computed(() => {
        return localeCtrl?.activeLocale || 'cs'
    })

    const formatters = computed(() => {
        return {
            time: new Intl.DateTimeFormat(locale.value, {
                hour: '2-digit',
                minute: '2-digit',
            }),
            date: new Intl.DateTimeFormat(locale.value, {
                // year: '2-digit',
                month: '2-digit',
                day: '2-digit',
            }),
        }
    })

    return {
        day(val: Date) {
            return val.toLocaleDateString(locale.value, {
                weekday: 'long',
            })
        },
        time(val: Date) {
            return formatters.value.time.format(val)
        },
        date(val: Date) {
            return formatters.value.date.format(val)
        },
    
        localized(val?: Localized<string>|null) {
            if (!val) {
                return ''
            }            

            return val[locale.value]
        },

        insertParams(text: string, params?: Record<string, string|Localized<string>>) {
            return text.replace(substitutionParamRegex, (match) => {
                const key = match.substring(1, match.length - 1)
                const replacement = params?.[key]
                if (!replacement || typeof replacement === 'string') {
                    return `{${key}}`
                }

                return this.localized(replacement)
            })
        },
    }
}

const substitutionParamRegex = /{[\w.]+}/g