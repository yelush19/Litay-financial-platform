import Papa from 'papaparse';

export interface ParseResult<T> {
  data: T[];
  errors: ParseError[];
  meta: {
    fields: string[];
    rowCount: number;
  };
}

export interface ParseError {
  row: number;
  message: string;
  field?: string;
}

export function parseCSV<T = Record<string, unknown>>(
  file: File,
  options?: {
    header?: boolean;
    skipEmptyLines?: boolean;
    encoding?: string;
  }
): Promise<ParseResult<T>> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: options?.header ?? true,
      skipEmptyLines: options?.skipEmptyLines ?? true,
      encoding: options?.encoding ?? 'UTF-8',
      complete: (results) => {
        const errors: ParseError[] = results.errors.map((err) => ({
          row: err.row ?? 0,
          message: err.message,
        }));

        resolve({
          data: results.data as T[],
          errors,
          meta: {
            fields: results.meta.fields || [],
            rowCount: results.data.length,
          },
        });
      },
      error: (error) => {
        resolve({
          data: [],
          errors: [{ row: 0, message: error.message }],
          meta: { fields: [], rowCount: 0 },
        });
      },
    });
  });
}

export function validateRequiredFields(
  row: Record<string, unknown>,
  requiredFields: string[],
  rowIndex: number
): ParseError[] {
  const errors: ParseError[] = [];

  for (const field of requiredFields) {
    const value = row[field];
    if (value === undefined || value === null || value === '') {
      errors.push({
        row: rowIndex,
        field,
        message: `שדה חובה חסר: ${field}`,
      });
    }
  }

  return errors;
}

export function parseNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : Number(value);
  return isNaN(num) ? null : num;
}

export function parseDate(value: unknown): string | null {
  if (!value || typeof value !== 'string') return null;

  // Try DD/MM/YYYY format
  const ddmmyyyy = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // Try YYYY-MM-DD format
  const yyyymmdd = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmdd) {
    return value;
  }

  return null;
}
