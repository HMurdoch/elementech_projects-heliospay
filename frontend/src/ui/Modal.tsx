import { ReactNode } from "react";

export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
    if (!open) return null;
    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 50 }} onMouseDown={onClose}>
            <div className="card" style={{ width: 560, maxWidth: '90%', margin: '10vh auto' }} onMouseDown={e => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
}