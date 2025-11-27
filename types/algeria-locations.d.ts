declare module 'algeria-locations' {
    export interface Wilaya {
        id: number;
        code: string;
        name: string;
        name_ar: string;
    }

    export interface Commune {
        id: number;
        code: string;
        name: string;
        name_ar: string;
        daira_id: number;
    }

    export function getWilayas(): Wilaya[];
    export function getCommunesByWilayaId(wilayaId: number | string): Commune[];
}
