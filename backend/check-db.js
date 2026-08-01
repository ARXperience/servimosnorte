const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

db.serialize(() => {
  db.all("SELECT id, name, images FROM products", (err, rows) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("=== PRODUCTOS EN LA BASE DE DATOS ===");
    rows.forEach((row) => {
      console.log(`ID: ${row.id} | Nombre: ${row.name}`);
      console.log(`Imágenes en DB: ${row.images}`);
      console.log("-----------------------------------");
    });
  });
});
