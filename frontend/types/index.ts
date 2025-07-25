export interface productsProp {
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
  gambar_path?: File | string | null;
}

export interface UserState {
  user_id: number | null;
  username: string | null;
  full_name: string | null;
  role: "super_admin" | "admin" | "field" | "operator" | null;
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
  stock?: number;
}

// PROPS UNTUK CUSTOMERS
export interface Customers {
  id: string;
  name: string;
  address: string;
  email?: string | null;
  no_telepon: string;
  sn: string;
  olt: string;
  odp: string;
  port_odp: string;
  last_edited: string;
  id_paket?: number | null;
  id_mitra?: number | null;
  paket?: Paket | null;
  mitra?: Mitra | null;
}

export interface Paket {
  id_paket: number | null;
  nama_paket: string | null;
  kecepatan_paket?: string | null;
  harga_paket?: number | null;
  comment_paket?: string | null;
}

export interface Mitra {
  id_mitra: number;
  nama_mitra: string;
  comment_mitra?: string;
}
