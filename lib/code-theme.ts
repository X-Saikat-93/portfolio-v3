import { createCssVariablesTheme } from 'shiki'

// One Shiki theme whose colours are CSS variables (--code-*), so code
// blocks follow the active palette like everything else. The warm,
// low-saturation values live in app/styles/components/code-blocks.css.
export const washiCodeTheme = createCssVariablesTheme({
  name: 'washi',
  variablePrefix: '--code-',
  variableDefaults: {},
  fontStyle: true,
})
