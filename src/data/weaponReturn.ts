/**
 * Weapon Return Mapping
 * Ported from OriginalGame/src/data/formulaConfig.js (lines 1-17)
 * 
 * Maps weapon/armor item IDs to scrap items returned when the weapon breaks
 */

export const weaponReturn: Record<string, string[]> = {
  "1301011": ["1102011"], // handgun
  "1301022": ["1102022"], // Rifle
  "1301033": ["1102033"], // automatic rifle
  "1301041": ["1101021"], // Magnum
  "1301052": ["1101021", "1101041"], // M40
  "1301063": ["1101021", "1101041"], // FAMAS
  "1301071": ["1101051", "1102011"], // Ehandgun
  "1301082": ["1101021", "1101041", "1101051", "1101051", "1102022"], // Erifle
  "1301091": ["1101021", "1101041"], // flame
  "1302011": [], // crowbar (no scrap)
  "1302021": [], // axe (no scrap)
  "1302032": ["1102042"], // katana
  "1302043": ["1101021", "1101041", "1101051"], // chainsaw
  "1304012": [], // shirt (no scrap)
  "1304023": [] // armor (no scrap)
}


