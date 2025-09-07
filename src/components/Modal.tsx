import { motion, AnimatePresence } from 'framer-motion'
export function Modal({open,onClose,children,title}:{open:boolean;onClose:()=>void;children:any;title?:string}){
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <div className="absolute inset-0 bg-black/40" onClick={onClose}/>
          <motion.div initial={{scale:.95,opacity:0}} animate={{scale:1,opacity:1}} exit={{scale:.95,opacity:0}} transition={{type:'spring', damping:18, stiffness:180}} className="relative z-10 w-full max-w-lg rounded-2xl border border-border p-4 glass">
            {title && <div className="text-lg font-semibold mb-3">{title}</div>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}