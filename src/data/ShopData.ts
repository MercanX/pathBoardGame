/**
 * File: src/data/ShopData.ts
 * Purpose:
 * - Shop'ta satılan tüm item'ları merkezi olarak tutar
 * - Şimdilik avatar ve path color item'ları içerir
 */

export type ShopItemType = "avatar" | "path"

export type ShopItem =
{
    id: string
    type: ShopItemType
    title: string
    price: number
    asset: string
}

export const ShopData: ShopItem[] =
[
    // =========================
    // AVATARS
    // =========================
    {
        id: "avatar_1",
        type: "avatar",
        title: "Avatar 01",
        price: 0,
        asset: "avatar_1"
    },
    {
        id: "avatar_2",
        type: "avatar",
        title: "Avatar 02",
        price: 200,
        asset: "avatar_2"
    },
    {
        id: "avatar_3",
        type: "avatar",
        title: "Avatar 03",
        price: 300,
        asset: "avatar_3"
    },
    {
        id: "avatar_4",
        type: "avatar",
        title: "Avatar 04",
        price: 400,
        asset: "avatar_4"
    },
    {
        id: "avatar_5",
        type: "avatar",
        title: "Avatar 05",
        price: 500,
        asset: "avatar_5"
    },
    {
        id: "avatar_6",
        type: "avatar",
        title: "Avatar 06",
        price: 600,
        asset: "avatar_6"
    },

    // =========================
    // PATH COLORS
    // =========================
    {
        id: "path_blue",
        type: "path",
        title: "Blue Path",
        price: 250,
        asset: "path_blue"
    },
    {
        id: "path_red",
        type: "path",
        title: "Red Path",
        price: 300,
        asset: "path_red"
    },
    {
        id: "path_green",
        type: "path",
        title: "Green Path",
        price: 350,
        asset: "path_green"
    },
    {
        id: "path_gold",
        type: "path",
        title: "Gold Path",
        price: 500,
        asset: "path_gold"
    }
]