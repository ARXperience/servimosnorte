import { join, resolve } from 'path';

export function getUploadsPath(): string {
    if (process.env.UPLOADS_DIR) {
        return resolve(process.env.UPLOADS_DIR);
    }

    // dist/main.js and uploads/ are sibling paths inside the Node.js app.
    return join(__dirname, '..', 'uploads');
}
