const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
test('product catalogue contains unique products with valid prices', () => {
 const products = JSON.parse(fs.readFileSync(path.join(root,'data/products.json'),'utf8'));
 assert.ok(products.length >= 10);
 assert.equal(new Set(products.map(p=>p.id)).size, products.length);
 for (const p of products) { assert.ok(p.name); assert.ok(p.price > 0); assert.ok(p.oldPrice >= p.price); assert.ok(p.category); }
});
test('frontend and server entry points exist', () => {
 for (const file of ['server.js','public/index.html','public/styles.css','public/app.js','data/orders.json']) assert.ok(fs.existsSync(path.join(root,file)), `${file} exists`);
});
test('package scripts include start and test', () => {
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 assert.equal(pkg.scripts.start,'node server.js'); assert.equal(pkg.scripts.test,'node --test');
});
