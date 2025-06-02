
import Papa from 'papaparse';
import { ImportedProduct } from './validation';

export const parseCSV = (file: File): Promise<ImportedProduct[]> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        resolve(results.data as ImportedProduct[]);
      },
      error: (error) => {
        reject(error);
      }
    });
  });
};
