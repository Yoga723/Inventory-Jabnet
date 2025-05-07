export interface recordsProp {
  record_id?: number;
  nama: string;
  tanggal: string;
  lokasi: string;
  list_barang: list_barang_props[];
  nilai?: string;
  keterangan?: string;
  status: string;
}

export interface list_barang_props {
  nama_barang: string;
  qty: number | 1;
}
