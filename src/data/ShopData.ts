/**
 * File: src/data/ShopData.ts
 * Purpose:
 * - Shop'ta satılan tüm item'ları merkezi olarak tutar
 * - Avatar, Path ve Background item'ları içerir
 */

export type ShopItemType = "avatar" | "path" | "background"

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
    },

    // =========================
    // BACKGROUNDS
    // =========================
    {
        id: "bg_autumn_dirt",
        type: "background",
        title: "Autumn Dirt",
        price: 200,
        asset: "cardbg_01"
    },
    {
        id: "bg_lava_full",
        type: "background",
        title: "Lava Core",
        price: 500,
        asset: "cardbg_02"
    },
    {
        id: "bg_dark_forest",
        type: "background",
        title: "Dark Forest",
        price: 300,
        asset: "cardbg_03"
    },
    {
        id: "bg_autumn_soft",
        type: "background",
        title: "Soft Autumn",
        price: 250,
        asset: "cardbg_04"
    },
    {
        id: "bg_leaves_dense",
        type: "background",
        title: "Leaf Carpet",
        price: 350,
        asset: "cardbg_05"
    },
    {
        id: "bg_ice_cracked",
        type: "background",
        title: "Frozen Ice",
        price: 400,
        asset: "cardbg_06"
    },
    {
        id: "bg_lava_crack",
        type: "background",
        title: "Lava Cracks",
        price: 450,
        asset: "cardbg_07"
    },
    {
        id: "bg_grass_path",
        type: "background",
        title: "Grass Path",
        price: 200,
        asset: "cardbg_08"
    },
    {
        id: "bg_stone_path",
        type: "background",
        title: "Stone Path",
        price: 200,
        asset: "cardbg_09"
    },
    {
        id: "bg_water_path",
        type: "background",
        title: "Water Path",
        price: 200,
        asset: "cardbg_10"
    },


]

export function getItemAssetById(id: string): string | null
{
    const item = ShopData.find(i => i.id === id)
    return item ? item.asset : null
}