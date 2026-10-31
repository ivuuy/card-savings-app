import { computed } from 'vue'
import { state, saveAppearance } from './app'
import { normalizeTheme, themeToStyle, createThemeTokens } from '../utils/theme.mjs'

export const currentTheme = computed(() => normalizeTheme(state.settings.appearance))
export const themeStyle = computed(() => themeToStyle(currentTheme.value))
export const themeTokens = computed(() => createThemeTokens(currentTheme.value))
export function saveTheme(value) { return saveAppearance(normalizeTheme(value)) }
