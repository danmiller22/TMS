import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LineChart, Truck, FileStack, Wallet, Cog, Package } from 'lucide-react'
import { Header } from '../components/Header'
import { motion, AnimatePresence } from 'framer-motion'

const nav=[
  {to:'/', label:'Dashboard', icon:LineChart},
  {to:'/trucks', label:'Trucks', icon:Truck},
  {to:'/trailers', label:'Trailers', icon:Package},
  {to:'/cases', label:'Cases', icon:FileStack},
  {to:'/finance', label:'Finance', icon:Wallet},
  {to:'/analytics', label:'Analytics', icon:LineChart},
  {to:'/settings', label:'Settings', icon:Cog},
]

export function RootLayout(){
  const location=useLocation()
  return (
    <div className="h-full grid grid-rows-[auto_1fr]">
      <Header/>
      <div className="h-full grid grid-cols-[260px_1fr]">
        <aside className="border-r border-border p-4">
          <nav className="flex flex-col gap-2">
            {nav.map(({to,label,icon:Icon})=> (
              <NavLink key={to} to={to} className={({isActive})=> 
                `flex items-center font-semibold gap-3 px-3 py-2 rounded-2xl transition will-change-transform
                 ${isActive?'bg-primary text-primary-foreground':'bg-secondary text-secondary-foreground'} hover:translate-x-0.5 hover:shadow-[0_12px_30px_rgba(0,0,0,.08)]`}>
                <Icon className="size-4"/><span className="text-sm">{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div key={location.pathname} initial={{opacity:0, y:8}} animate={{opacity:1, y:0}} exit={{opacity:0, y:-8}} transition={{type:'spring', stiffness:220, damping:24}}>
              <Outlet/>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}