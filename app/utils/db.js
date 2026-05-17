import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data.json');

export function getDatabase() {
  if (!fs.existsSync(dataFilePath)) {
    // Added 'users' array to the default structure
    const defaultData = { users: [], products: [], orders: [] };
    fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2));
  }
  return JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
}

export function saveDatabase(data) {
  fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}