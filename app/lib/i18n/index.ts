
import { tr } from './dictionaries/tr';
import { en } from './dictionaries/en';

export const dictionaries = {
    tr,
    en,
};

export type Language = keyof typeof dictionaries;

// Helper type to convert literal values to string
type DeepReplace<T> = {
    [K in keyof T]: T[K] extends object ? DeepReplace<T[K]> : string;
};

export type Dictionary = DeepReplace<typeof tr>;

// Advanced type for nested keys (e.g., "nav.home")
// Handles up to 3 levels of nesting, which is usually sufficient
type Join<K, P> = K extends string | number ?
    P extends string | number ?
    `${K}${"" extends P ? "" : "."}${P}`
    : never : never;

type Prev = [never, 0, 1, 2, 3, 4, 5, ...0[]];

export type TranslationKeys<T, D extends number = 3> = [D] extends [never] ? never : T extends object ?
    { [K in keyof T]-?: Join<K, TranslationKeys<T[K], Prev[D]>> }[keyof T]
    : "";

export type TxKey = TranslationKeys<typeof tr>;

export const getDictionary = (lang: Language): Dictionary => dictionaries[lang] as unknown as Dictionary;
