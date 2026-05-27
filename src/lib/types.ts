// ─── Pagination ───────────────────────────────────────────
export interface PaginationParams {
    page: number;
    per_page: number;
  }
  
  export interface PaginatedResult<T> {
    data: T[];
    meta: {
      page: number;
      per_page: number;
      total: number;
      total_pages: number;
    };
  }
  
  // ─── Sort ─────────────────────────────────────────────────
  export type SortOrder = "asc" | "desc";
  
  export interface SortParams {
    sort_by: string;
    sort_order: SortOrder;
  }
  
  // ─── Common entity shape ──────────────────────────────────
  export interface BaseEntity {
    id: string;
    created_at: Date;
    updated_at: Date;
  }
  
  // ─── Select option ────────────────────────────────────────
  export interface SelectOption<T = string> {
    label: string;
    value: T;
    disabled?: boolean;
  }
  
  // ─── Money ────────────────────────────────────────────────
  export type Money = {
    amount: number; // in cents
    currency: string;
  };
  
  // ─── Status ───────────────────────────────────────────────
  export type ActiveStatus = "active" | "inactive" | "archived";
  
  // ─── Nullable ─────────────────────────────────────────────
  export type Nullable<T> = T | null;
  export type Optional<T> = T | undefined;
  export type Maybe<T> = T | null | undefined;
  
  // ─── Deep partial ─────────────────────────────────────────
  export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
  };
  