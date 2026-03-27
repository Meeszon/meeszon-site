import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';

const EYE_BALLZ_OUTPUTS = path.resolve(__dirname, '../facetracking/eye-ballz/outputs');

export default defineConfig({
  publicDir: 'public',
  plugins: [
    {
      name: 'serve-eye-ballz-outputs',
      configureServer(server) {
        // Proxy /outputs/* → eye-ballz outputs folder during dev
        server.middlewares.use('/outputs', (req, res, next) => {
          const filePath = path.join(EYE_BALLZ_OUTPUTS, req.url ?? '');
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath);
            const mime = ext === '.webp' ? 'image/webp' : ext === '.png' ? 'image/png' : 'application/octet-stream';
            res.setHeader('Content-Type', mime);
            fs.createReadStream(filePath).pipe(res);
          } else {
            next();
          }
        });
      },
    },
  ],
});
