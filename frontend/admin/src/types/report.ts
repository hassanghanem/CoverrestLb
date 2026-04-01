// types/report.ts
export interface ReportColumn {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'boolean';
  sortable?: boolean;
  filterable?: boolean;
}

export interface ReportData {
  [key: string]: any;
}

export interface ReportFilterOption {
  value: string;
  label: string;
}

export interface ReportFilter {
  key: string;
  label: string;
  type: 'date' | 'select' | 'text' | 'number';
  options?: ReportFilterOption[];
}


export interface ReportState {
  data: ReportData[];
  loading: boolean;
  error: string | null;
  filters: Record<string, any>;
  pagination: {
    page: number;
    perPage: number;
    total: number;
  };
  sorting: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  };
}

export interface UseReportOptions {
  autoFetch?: boolean;
  defaultFilters?: Record<string, any>;
  defaultSort?: { sortBy: string; sortOrder: 'asc' | 'desc' };
}

export interface FilterConfig {
  key: string;
  label: string;
  type: 'date' | 'select' | 'text' | 'number';
  options?: Array<{ value: string; label: string }>;
  placeholder?: string;
}

export interface ColumnConfig {
  key: string;
  label: string;
  type: 'text' | 'number' | 'currency' | 'date' | 'datetime' | 'status';
  sortable: boolean;
  format?: (value: any) => string;
}

export interface ReportConfig {
  name: string;
  endpoint: string;
  exportable: boolean;
  printable: boolean;
  filters: FilterConfig[];
  columns: ColumnConfig[];
}