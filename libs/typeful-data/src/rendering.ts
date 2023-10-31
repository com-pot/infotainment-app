import { App, computed, h, inject, provide } from "vue"
import { GlobalArgs } from "@com-pot/infotainment-app/panels/globalArgs"
import { Localized, LocalizedTextContent } from "@typeful/model/types/I18n"
import { LocaleController } from "@cp-infotainment/i18n/localeController"


export const rendererDiKey = '@typeful/data:renderer'
export function provideRenderer(renderer: ReturnType<typeof createRenderer>, app?: App) {
    app ? app.provide(rendererDiKey, renderer) : provide(rendererDiKey, renderer)
}
export function useRender(): ReturnType<typeof createRenderer> {
    return inject(rendererDiKey)!
}

type RendererOpts = {
    defaultLocale: string,
    localeOverride?: {
        // "cs" to use 24H format
        time?: string,
        date?: string,
        day?: string,
    },
}
export function createRenderer(opts: RendererOpts, globalArgs: GlobalArgs,localeCtrl?: LocaleController) {
    const locale = computed(() => {
        return localeCtrl?.activeLocale || opts.defaultLocale
    })

    const formatters = computed(() => {
        const localeStr = locale.value
        return {
            time: new Intl.DateTimeFormat(opts.localeOverride?.time || localeStr, {
                hour: '2-digit',
                minute: '2-digit',
            }),
            date: new Intl.DateTimeFormat(opts.localeOverride?.date || localeStr, {
                // year: '2-digit',
                month: '2-digit',
                day: '2-digit',
            }),
        }
    })

    return {
        day(val: Date) {
            return val.toLocaleDateString(opts.localeOverride?.day || locale.value, {
                weekday: 'long',
            })
        },
        time(val: Date) {
            return formatters.value.time.format(val)
        },
        date(val: Date) {
            return formatters.value.date.format(val)
        },

        localized<T = string>(val?: Localized<T> | null | undefined): ''|T {
            const result = val?.[locale.value]
            if (!result) {
                console.warn("Localized bundle ", val, " does not contain locale value for ", locale.value);
                return ''
            }

            return result
        },

        insertParams(text: string, params?: Record<string, string|Localized<string>>) {
            if (!text) {
                return text
            }

            return text.replace(substitutionParamRegex, (match) => {
                const key = match.substring(1, match.length - 1)
                const replacement = params?.[key] ?? globalArgs.get(key)

                if (!replacement) {
                    return `{${key}}`
                }
                if (typeof replacement === 'string') {
                    return replacement
                }

                return this.localized(replacement)
            })
        },

        localizedComponent(tag: string, props: Record<string, any>, content: LocalizedTextContent) {
            const localeEntry = this.localized(content)
            if (!localeEntry) {
                return
            }
            const renderProps = {
                ...props,
            }
            const children = []

            if (typeof localeEntry === 'string') {
                children.push(this.insertParams(localeEntry))
            } else if (typeof localeEntry === 'object' && localeEntry.html) {
                renderProps.innerHTML = this.insertParams(localeEntry.html)
            } else {
                console.warn("Unknown content type", content);
                return
            }

            return h(tag, renderProps, children)
        }
    }
}

const substitutionParamRegex = /{[\w.\-_]+}/g
