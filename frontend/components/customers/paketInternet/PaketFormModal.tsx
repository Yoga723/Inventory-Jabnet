import { Paket } from "types";

interface PaketFormProps {
  isOpen: boolean;
  formData: Partial<Paket>;
  onClose: () => void;
  onSubmit: (event: React.FormEvent) => void;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const PaketForm = ({ isOpen, formData, onClose, onSubmit, onChange }: PaketFormProps) => {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">{formData.id_paket ? "Edit Paket" : "Tambah Paket Baru"}</h3>
        <form onSubmit={onSubmit}>
          <div className="form-control">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Nama Paket</legend>
            <input
              type="text"
              name="nama_paket"
              value={formData.nama_paket || ""}
              onChange={onChange}
              className="input input-bordered w-full"
              placeholder="Paket Halal"
              required
              />
              </fieldset>
          </div>
          <div className="form-control">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Kecepatan</legend>
            <input
              type="text"
              name="kecepatan_paket"
              value={formData.kecepatan_paket || ""}
              onChange={onChange}
              placeholder="15Mbps"
              className="input input-bordered w-full"
              />
              </fieldset>
          </div>
          <div className="form-control">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Harga</legend>
            <input
              type="number"
              name="harga_paket"
              placeholder="169000"
              value={formData.harga_paket || ""}
              onChange={onChange}
              className="input input-bordered w-full"
              />
              </fieldset>
          </div>
          <div className="form-control">
            <fieldset className="fieldset">
              <legend className="fieldset-legend">Keterangan</legend>
            <textarea
              name="comment_paket"
              value={formData.comment_paket || ""}
              onChange={onChange}
              placeholder="Paket khusus di Cibunar"
              className="textarea w-full"
              />
              <p>Opsional</p>
              </fieldset>
          </div>
          <div className="modal-action">
            <button type="button" onClick={onClose} className="btn">
              Batal
            </button>
            <button type="submit" className="btn btn-primary">
              Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaketForm;