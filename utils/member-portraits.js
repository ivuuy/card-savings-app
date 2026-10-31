import portraits from '../static/portraits/manifest.json'

export const originalPortrait = id => portraits[id] || ''
