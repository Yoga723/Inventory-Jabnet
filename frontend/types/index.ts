<<<<<<< HEAD
export interface recordsProp {
  record_id?: number;
  nama: string;
  tanggal: string;
  lokasi: string;
  list_barang: list_barang_props[];
  nilai?: number;
  keterangan?: string;
  status: string;
}

export interface list_barang_props {
  nama_barang: string;
  qty: number | 1;
}

export interface UserState {
  user_id: number | null;
  username: string | null;
  full_name: string | null;
  role: string | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}
=======
export interface recordsProp {
  record_id?: number;
  nama: string;
  tanggal: string;
  lokasi: string;
  list_barang: list_barang_props[];
  nilai?: number;
  keterangan?: string;
  status: string;
}

export interface list_barang_props {
  nama_barang: string;
  qty: number | 1;
}

export interface UserState {
  user_id: number | null;
  username: string | null;
  full_name: string | null;
  role: string | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}
>>>>>>> 4289c65a (change name placeholder)
