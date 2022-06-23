import { App } from "vue";
import { provideConGameApi } from "./conGameApi";

export default {
    install(vue: App) {
        provideConGameApi(vue)
    }
}