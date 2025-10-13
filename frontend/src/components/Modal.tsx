import { useEffect } from "react";

type ModalProps = {
    title?: string;
    open: boolean;
    onClose: () => void;
    widthClassName?: string; // e.g. "w-[520px]"
    children: React.ReactNode;
    footer?: React.ReactNode;
};

export default function Modal({ title, open, onClose, children, footer, widthClassName }: ModalProps) {
    useEffect(() => {
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") onClose();
        }
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className={`modal ${widthClassName ?? ""}`} onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>{title ?? ""}</h3>
                    <button className="btn sm" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="modal-body">{children}</div>
                {footer && <div className="modal-footer">{footer}</div>}
            </div>
        </div>
    );
}