import { Modal } from "./Modal";
import { IconAlertTriangle } from "./icons";

export function ConfirmDialog({ title, message, confirmLabel = "Confirmer", onConfirm, onClose, danger = true }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      width="380px"
      footer={
        <>
          <button className="btn btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            className="btn btn-primary"
            style={danger ? { background: "var(--danger)" } : undefined}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="confirm-icon">
        <IconAlertTriangle />
      </div>
      <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.5 }}>{message}</p>
    </Modal>
  );
}
