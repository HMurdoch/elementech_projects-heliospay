import { createContext, useContext, useState } from "react";

type Toast = { id: number; kind?: 'ok' | 'warn' | 'err'; text: string };
const Ctx = createContext<{ push: (t: Omit<Toast, 'id'>) => void }>({ push: () => { } });

export function ToastProvider({ children }: { children: any }) {
    const [items, setItems] = useState<Toast[]>([]);
    function push(t: Omit<Toast, 'id'>) {
        const id = Date.now() + Math.random();
        setItems(x => [...x, { id, ...t }]); setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 3500);
    }
    return (
        <Ctx.Provider value={{ push }}>
            {children}
            <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 60 }}>
                {items.map(t => (
                    <div key={t.id} className="card" style={{ background: t.kind === 'err' ? '#2a1820' : t.kind === 'ok' ? '#0f1f18' : '#1f1b0d', borderColor: 'var(--line)' }}>
                        {t.text}
                    </div>
                ))}
            </div>
        </Ctx.Provider>
    )
}
export const useToast = () => useContext(Ctx);