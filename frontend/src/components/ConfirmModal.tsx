import Modal from "./Modal";

type Props = {
    open: boolean;
    title?: string;
    message?: string | React.ReactNode;
    onCancel: () => void;
    onConfirm: () => void;
    confirming?: boolean;
};

export default function ConfirmModal({ open, title, message, onCancel, onConfirm, confirming }: Props) {
    return (
        <Modal
            open={open}
            onClose={onCancel}
            title={title ?? "Confirm"}
            widthClassName="w-[480px]"
            footer={
                <div className="row gap-8">
                    <button className="btn" onClick={onCancel} disabled={confirming}>Cancel</button>
                    <button className="btn danger" onClick={onConfirm} disabled={confirming}>
                        {confirming ? "Deleting…" : "Delete"}
                    </button>
                </div>
            }
        >
            <div className="confirm-body">{message ?? "Are you sure?"}</div>
        </Modal>
    );
}