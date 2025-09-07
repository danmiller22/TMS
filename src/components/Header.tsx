import { Search, Upload, Sun, Moon, Settings as Gear } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { getInitialTheme, applyTheme, Theme } from '../lib/theme'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useTms } from '../store/tms'

function useHotkey(k:string, cb:()=>void){
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if((e.ctrlKey||e.metaKey)&& e.key.toLowerCase()===k.toLowerCase()){ e.preventDefault(); cb() } }
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h)
  },[k,cb])
}

function SearchModal({open,onClose}:{open:boolean; onClose:()=>void}){
  const {trucks, trailers, cases} = useTms()
  const nav = useNavigate()
  const [q,setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  useEffect(()=>{ if(open) setTimeout(()=>inputRef.current?.focus(),10) },[open])
  const results = [
// src/components/Header.tsx — фрагмент поиска
// ЗАМЕНИТЕ только эти массивы, остальной файл не трогаем
...trucks.filter(t => [t.id, t.vin ?? '', t.make ?? ''].some(x => x.toLowerCase().includes(q.toLowerCase()))).map(t => ({ type: 'Truck', id: t.id, to: '/trucks' })),
...trailers.filter(t => [t.id, t.owner ?? '', t.extCode ?? ''].some(x => x.toLowerCase().includes(q.toLowerCase()))).map(t => ({ type: 'Trailer', id: t.id, to: '/trailers' })),
...cases.filter(c => [c.id, c.title, c.assetId ?? ''].some(x => x.toLowerCase().includes(q.toLowerCase()))).map(c => ({ type: 'Case', id: c.id, to: '/cases' })),
,
  ].slice(0,8)
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
          <motion.div initial={{y:8,opacity:0}} animate={{y:0,opacity:1}} exit={{y:8,opacity:0}} transition={{type:'spring', stiffness:220, damping:22}} className="relative z-10 w-full max-w-xl rounded-2xl border border-border p-4 glass">
            <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2">
              <Search className="size-4 opacity-60"/><input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search trucks / trailers / cases…" className="bg-transparent outline-none text-sm w-full"/>
            </div>
            <div className="mt-3">
              {results.length===0 ? <div className="text-sm opacity-60 px-1 py-2">No results</div> :
                results.map((r,i)=>(
                  <button key={i} onClick={()=>{ nav(r.to); onClose() }} className="w-full text-left px-3 py-2 rounded-xl hover:bg-secondary transition">
                    <span className="text-xs opacity-60 mr-2">{r.type}</span><b>{r.id}</b>
                  </button>
                ))
              }
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function Header(){
  const [theme,setTheme]=useState<Theme>('dark')
  const [openSearch,setOpenSearch]=useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const nav = useNavigate()
  const tms = useTms()

  useEffect(()=>{ const t=getInitialTheme(); setTheme(t); applyTheme(t) },[])
  useHotkey('k',()=>setOpenSearch(true))

  const toggle=()=>{ const n=theme==='dark'?'light':'dark'; setTheme(n); applyTheme(n) }
  const doImport=(e:React.ChangeEvent<HTMLInputElement>)=>{
    const f=e.target.files?.[0]; if(!f) return;
    const r=new FileReader(); r.onload=()=>{ try{ tms.importJson(JSON.parse(r.result as string)) } catch { alert('Invalid JSON') } }
    r.readAsText(f)
  }

  return (
    <div className="sticky top-0 z-10 border-b border-border bg-background/70 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex items-center gap-3 mr-auto">
          <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-xl shadow-[0_12px_30px_rgba(0,0,0,.12)]" />
          <div className="text-sm">
            <b>US Team Fleet — TMS</b> <span className="ml-2 chip">Free</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-2xl bg-secondary px-3 py-2 w-[360px]">
            <Search className="size-4 opacity-60"/>
            <input placeholder="Quick search (Ctrl+K)" onFocus={()=>setOpenSearch(true)} className="bg-transparent outline-none text-sm w-full"/>
          </div>
          <button className="btn btn-ghost" onClick={()=>nav('/settings')} title="Settings"><Gear className="size-4"/></button>
          <button className="btn btn-ghost" onClick={()=>fileRef.current?.click()} title="Import"><Upload className="size-4"/><span className="hidden sm:inline">Import</span></button>
          <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={doImport}/>
          <motion.button whileTap={{scale:0.96}} onClick={toggle} className="btn btn-ghost" title="Toggle theme">
            {theme==='dark'?<Sun className="size-4"/>:<Moon className="size-4"/>}
          </motion.button>
        </div>
      </div>
      <SearchModal open={openSearch} onClose={()=>setOpenSearch(false)}/>
    </div>
  )
}