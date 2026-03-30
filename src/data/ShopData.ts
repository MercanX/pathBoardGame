/**
 * File: src/data/ShopData.ts
 * Purpose:
 * - Shop'ta satılan tüm item'ları merkezi olarak tutar
 * - Avatar, Path ve Background item'ları içerir
 */

export type ShopItemType = "avatar" | "path" | "board"

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
        type: "board",
        title: "Autumn Dirt",
        price: 200,
        asset: "cardbg_01"
    },
    {
        id: "bg_lava_full",
        type: "board",
        title: "Lava Core",
        price: 500,
        asset: "cardbg_02"
    },
    {
        id: "bg_dark_forest",
        type: "board",
        title: "Dark Forest",
        price: 300,
        asset: "cardbg_03"
    },
    {
        id: "bg_autumn_soft",
        type: "board",
        title: "Soft Autumn",
        price: 250,
        asset: "cardbg_04"
    },
    {
        id: "bg_leaves_dense",
        type: "board",
        title: "Leaf Carpet",
        price: 350,
        asset: "cardbg_05"
    },
    {
        id: "bg_ice_cracked",
        type: "board",
        title: "Frozen Ice",
        price: 400,
        asset: "cardbg_06"
    },
    {
        id: "bg_lava_crack",
        type: "board",
        title: "Lava Cracks",
        price: 450,
        asset: "cardbg_07"
    },
    {
        id: "bg_grass_path",
        type: "board",
        title: "Grass Path",
        price: 200,
        asset: "cardbg_08"
    },
    {
        id: "bg_stone_path",
        type: "board",
        title: "Stone Path",
        price: 200,
        asset: "cardbg_09"
    },
    {
        id: "bg_water_path",
        type: "board",
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