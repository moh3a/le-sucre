export type WarehouseRow = {
  id: string;
  name: string;
  slug: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type WarehouseOption = {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
};
