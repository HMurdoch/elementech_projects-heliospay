export default function Confirm({ open, title, text, onConfirm, onClose }: { open: boolean, title: string, text?: string, onConfirm: () => void, onClose: () => void }) {
    if (!open) return null
    return (
        <div className="center" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)' }}>
            <div className="panel" style={{ width: 420 }}>
                <div className="h1" style={{ fontSize: '1.2rem' }}>{title}</div>
                <div className="muted" style={{ margin: '10px 0 18px' }}>{text}</div>
                <div className="flex right">
                    <button className="ghost" onClick={onClose}>Cancel</button>
                    <button className="danger" onClick={() => { onConfirm(); onClose() }}>Delete</button>
                </div>
            </div>
        </div>
    )
}