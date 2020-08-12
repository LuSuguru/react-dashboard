const prefixes = ['Moz', 'Webkit', 'O', 'ms']

export function getPrefix(prop = 'transform') {
  if (typeof window === 'undefined' || typeof window.document === 'undefined') return ''

  const { style } = window.document.documentElement

  if (prop in style) return ''

  for (let i = 0; i < prefixes.length; i++) {
    if (browserPrefixToKey(prop, prefixes[i]) in style) return prefixes[i]
  }

  return ''
}

export function browserPrefixToKey(prop: string, prefix: string) {
  return prefix ? `${prefix}${kebabToTitleCase(prop)}` : prop
}

export function browserPrefixToStyle(prop: string, prefix: string) {
  return prefix ? `-${prefix.toLowerCase()}-${prop}` : prop
}

function kebabToTitleCase(str: string) {
  let out = ''
  let shouldCapitalize = true
  for (let i = 0; i < str.length; i++) {
    if (shouldCapitalize) {
      out += str[i].toUpperCase()
      shouldCapitalize = false
    } else if (str[i] === '-') {
      shouldCapitalize = true
    } else {
      out += str[i]
    }
  }
  return out
}

export default getPrefix()
