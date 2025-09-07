export type Theme='light'|'dark'
const KEY='utcn-theme'
export const getInitialTheme=():Theme=>{
  const s=localStorage.getItem(KEY) as Theme|null
  return s ?? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}
export const applyTheme=(t:Theme)=>{
  const root=document.documentElement
  t==='dark' ? root.classList.add('dark') : root.classList.remove('dark')
  localStorage.setItem(KEY,t)
}