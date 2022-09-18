import { PanelDataProviderUntyped } from "./panels/dataProviders";
import { PanelEntrySpec } from "./panels/panelRegistry";

export const defineItPanelModule = <T extends ItPanelModule>(module: T) => module

export type ItPanelModule = {
    name: string,
    panels: PanelEntrySpec[],
    dataProviders?: Record<string, PanelDataProviderUntyped>,
}
