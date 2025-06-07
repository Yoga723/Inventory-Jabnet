export interface recordsProp {
  record_id?: number;
  nama: string;
  tanggal: string;
  lokasi: string;
  list_barang: list_barang_props[];
  nilai?: number;
  keterangan?: string;
  status: string;
  kategori?: string;
  kategori_id?:number;
}

export interface list_barang_props {
  barang_id?: number;
  nama_barang: string;
  qty: number | 1;
  harga_per_unit?: number; 
}

export interface UserState {
  user_id: number | null;
  username: string | null;
  full_name: string | null;
  role: string | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}
