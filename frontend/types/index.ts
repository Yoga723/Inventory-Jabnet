export interface recordsProp {
  record_id?: number;
  nama: string;
  tanggal: string;
  lokasi: string;
  item_list: item_list_props[];
  nilai?: number;
  keterangan?: string;
  status: string;
  kategori?: string;
  kategori_id?: number;
}

export interface item_list_props {
  item_id?: number;
  item_name: string;
  qty: number | 1;
  price_per_item?: number;
}

export interface UserState {
  user_id: number | null;
  username: string | null;
  full_name: string | null;
  role: string | null;
  token: string | null;
  status: "idle" | "loading" | "succeeded" | "failed";
}

// Props untuk kategori barang seperti Backbone, Distribusi, dll
export interface Kategori {
  kategori_id: number;
  nama_kategori: string;
}

// Item props untuk daftar item yang ada didatabase
export interface Item {
  item_id: number;
  item_name: string;
  kategori_id: number;
  nama_kategori?: string;
  created_at: string;
}
