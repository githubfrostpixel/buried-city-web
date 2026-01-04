/**
 * Attribute Warning Range Configuration
 * Shared configuration for TopBar display and warning checks
 * Matches TopBar AttrButton warnRange settings
 */

import { Range } from '@/shared/utils/math/range'

export interface AttributeWarningConfig {
  range: Range
  reversePercentage: boolean
  displayName: string
  reasonText: string
}

export const attributeWarningRanges: Record<string, AttributeWarningConfig> = {
  injury: {
    range: new Range("[0,0.5]"),
    reversePercentage: true,
    displayName: "Injury",
    reasonText: "injury is too high"
  },
  infect: {
    range: new Range("[0,0.75]"),
    reversePercentage: true,
    displayName: "Infection",
    reasonText: "infection is too high"
  },
  starve: {
    range: new Range("[0,0.5]"),
    reversePercentage: false,
    displayName: "Hunger",
    reasonText: "hunger is too low"
  },
  vigour: {
    range: new Range("[0,0.5]"),
    reversePercentage: false,
    displayName: "Energy",
    reasonText: "energy is too low"
  },
  spirit: {
    range: new Range("[0,0.5]"),
    reversePercentage: false,
    displayName: "Mood",
    reasonText: "mood is too low"
  },
  water: {
    range: new Range("[0,0.5]"),
    reversePercentage: false,
    displayName: "Thirst",
    reasonText: "thirst is too low"
  },
  virus: {
    range: new Range("[0.80,1]"),
    reversePercentage: false,
    displayName: "Virus",
    reasonText: "virus is too high"
  },
  hp: {
    range: new Range("[0,0.5]"),
    reversePercentage: false,
    displayName: "HP",
    reasonText: "HP is too low"
  }
}

