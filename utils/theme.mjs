export const DEFAULT_THEME = Object.freeze({ accent: '#4f796d', background: '#f7f9f8', surface: '#ffffff' })

export const THEME_PRESETS = [
  { name: '薄荷灰', accent: '#4f796d', background: '#f7f9f8', surface: '#ffffff' },
  { name: '樱花粉', accent: '#b96c86', background: '#fbf5f7', surface: '#ffffff' },
  { name: '雾紫', accent: '#8971b1', background: '#f7f5fb', surface: '#ffffff' },
  { name: '晴空蓝', accent: '#527fba', background: '#f2f6fb', surface: '#ffffff' },
  { name: '青柠', accent: '#799345', background: '#f5f8ef', surface: '#ffffff' },
  { name: '奶油黄', accent: '#b48a32', background: '#fcf9ef', surface: '#ffffff' },
  { name: '蜜桃橙', accent: '#c47b57', background: '#fcf5f1', surface: '#ffffff' },
  { name: '莓果红', accent: '#b75568', background: '#fcf3f5', surface: '#ffffff' },
  { name: '石墨灰', accent: '#666b72', background: '#f3f4f5', surface: '#ffffff' },
  { name: '深夜蓝', accent: '#92b7e6', background: '#171e2b', surface: '#242f42' }
]

export function normalizeHex(value) {
  if (typeof value !== 'string') return null
  let hex = value.trim().replace(/^#/, '')
  if (/^[\da-f]{3}$/i.test(hex)) hex = hex.split('').map(c => c + c).join('')
  return /^[\da-f]{6}$/i.test(hex) ? `#${hex.toLowerCase()}` : null
}

export function normalizeTheme(value) {
  return Object.fromEntries(Object.keys(DEFAULT_THEME).map(key => [key, normalizeHex(value?.[key]) || DEFAULT_THEME[key]]))
}

const rgb = color => normalizeHex(color).slice(1).match(/../g).map(c => parseInt(c, 16))
const hex = values => '#' + values.map(v => Math.round(v).toString(16).padStart(2, '0')).join('')
export function mixColors(first, second, amount) { return hex(rgb(first).map((v, i) => v * (1 - amount) + rgb(second)[i] * amount)) }
function luminance(color) {
  const values = rgb(color).map(v => { const s = v / 255; return s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4 })
  return values[0] * .2126 + values[1] * .7152 + values[2] * .0722
}
export function contrastRatio(first, second) { const a = luminance(first), b = luminance(second); return (Math.max(a, b) + .05) / (Math.min(a, b) + .05) }
export function readableText(background) {
  if (contrastRatio('#24272b', background) >= 4.6) return '#24272b'
  return contrastRatio('#000000', background) >= contrastRatio('#ffffff', background) ? '#000000' : '#ffffff'
}
function fitText(color, background, minimum = 4.6) {
  if (contrastRatio(color, background) >= minimum) return color
  const target = readableText(background)
  for (let step = 1; step <= 100; step++) { const candidate = mixColors(color, target, step / 100); if (contrastRatio(candidate, background) >= minimum) return candidate }
  return target
}
function textSet(background, accent) {
  const ink = fitText('#39413f', background, 7)
  return { ink, muted: fitText(mixColors(ink, background, .4), background), accent: fitText(accent, background) }
}

export function createThemeTokens(value) {
  const theme = normalizeTheme(value), paper = theme.background, surface = theme.surface, accent = theme.accent
  const soft = mixColors(surface, accent, .18), light = mixColors(surface, accent, .07)
  const p = textSet(paper, accent), s = textSet(surface, accent), a = textSet(soft, accent), l = textSet(light, accent)
  const tokens = {
    paper, surface, ink: p.ink, muted: p.muted, line: mixColors(paper, p.ink, .14), accent,
    'on-accent': readableText(accent), 'accent-dark': p.accent, 'accent-soft': soft, 'accent-light': light,
    'surface-ink': s.ink, 'surface-muted': s.muted, 'surface-line': mixColors(surface, s.ink, .14), 'surface-accent': s.accent,
    'soft-ink': a.ink, 'soft-muted': a.muted, 'soft-line': mixColors(soft, a.ink, .16), 'soft-accent': a.accent,
    'light-ink': l.ink, 'light-muted': l.muted, 'light-line': mixColors(light, l.ink, .14), 'light-accent': l.accent,
    'card-base': mixColors(surface, accent, .12), 'card-rare': soft, 'card-limited': mixColors(surface, accent, .26),
    'card-ink': fitText(accent, mixColors(surface, accent, .12), 7),
    'card-muted': fitText(accent, mixColors(surface, accent, .12), 4.8),
    'card-rare-ink': fitText(accent, soft, 7), 'card-rare-muted': fitText(accent, soft, 4.8),
    'card-limited-ink': fitText(accent, mixColors(surface, accent, .26), 7), 'card-limited-muted': fitText(accent, mixColors(surface, accent, .26), 4.8),
    'soft-danger': fitText('#b34b61', soft), 'light-danger': fitText('#b34b61', light),
    'cover-mask': `rgba(${rgb(light).join(',')},.9)`, 'danger': fitText('#b34b61', paper), 'surface-danger': fitText('#b34b61', surface)
  }
  return Object.fromEntries(Object.entries(tokens).map(([key, value]) => [`--${key}`, value]))
}

export const themeToStyle = value => Object.entries(createThemeTokens(value)).map(([key, value]) => `${key}:${value}`).join(';')

export function hexToHsl(color) {
  const [r, g, b] = rgb(color).map(v => v / 255), max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min, l = (max + min) / 2
  let h = 0, s = 0
  if (d) { s = d / (1 - Math.abs(2 * l - 1)); h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360 }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}
export function hslToHex({ h, s, l }) {
  s = Math.min(100, Math.max(0, s)) / 100; l = Math.min(100, Math.max(0, l)) / 100
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2
  const values = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  return hex(values.map(v => (v + m) * 255))
}
