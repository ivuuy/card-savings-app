import test from 'node:test'
import assert from 'node:assert/strict'
import { DEFAULT_THEME, THEME_PRESETS, normalizeHex, normalizeTheme, createThemeTokens, contrastRatio, hexToHsl, hslToHex } from '../utils/theme.mjs'

test('legacy themes and malformed color values use safe defaults', () => {
  assert.deepEqual(normalizeTheme(undefined), DEFAULT_THEME)
  assert.equal(normalizeHex(' #ABC '), '#aabbcc')
  for (const invalid of ['red', '#12', '#1234567', 'url(test)', '', null]) assert.equal(normalizeHex(invalid), null)
  assert.deepEqual(normalizeTheme({ accent: '#f00', background: 'invalid', surface: null }), { ...DEFAULT_THEME, accent: '#ff0000' })
})

test('full hue spectrum and achromatic endpoints convert correctly', () => {
  for (const [h, expected] of [[0, '#ff0000'], [60, '#ffff00'], [120, '#00ff00'], [180, '#00ffff'], [240, '#0000ff'], [300, '#ff00ff']]) {
    assert.equal(hslToHex({ h, s: 100, l: 50 }), expected)
    assert.equal(hexToHsl(expected).h, h)
  }
  assert.equal(hslToHex({ h: 359, s: 100, l: 0 }), '#000000')
  assert.equal(hslToHex({ h: 359, s: 100, l: 100 }), '#ffffff')
})

test('preset and mixed dark/light themes keep body, card and button text readable', () => {
  const themes = [...THEME_PRESETS]
  for (const accent of ['#ffffff', '#000000', '#ffff00', '#ff00ff', '#00ff00']) {
    for (const background of ['#000000', '#ffffff', '#888888']) {
      for (const surface of ['#ffffff', '#121212', '#808080']) themes.push({ accent, background, surface })
    }
  }
  for (const theme of themes) {
    const tokens = createThemeTokens(theme)
    for (const [foreground, background] of [['ink', 'paper'], ['muted', 'paper'], ['accent-dark', 'paper'], ['surface-ink', 'surface'], ['surface-muted', 'surface'], ['surface-accent', 'surface'], ['soft-accent', 'accent-soft'], ['light-muted', 'accent-light'], ['on-accent', 'accent'], ['card-muted', 'card-base'], ['card-rare-muted', 'card-rare'], ['card-limited-muted', 'card-limited']]) {
      assert.ok(contrastRatio(tokens[`--${foreground}`], tokens[`--${background}`]) >= 4.5, `${foreground} on ${background}: ${JSON.stringify(theme)}`)
    }
    assert.equal(tokens['--accent'], theme.accent)
    assert.equal(tokens['--paper'], theme.background)
    assert.equal(tokens['--surface'], theme.surface)
  }
})
