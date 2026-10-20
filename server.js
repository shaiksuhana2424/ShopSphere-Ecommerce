const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA = path.join(ROOT, 'data');
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const MIME = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.svg':'image/svg+xml' };
function readJson(name) { return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8')); }
function writeJson(name, value) { fs.writeFileSync(path.join(DATA, name), JSON.stringify(value, null, 2) + '\n'); }
function send(res, status, payload) { res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}); res.end(JSON.stringify(payload)); }
function bodyJson(req) { return new Promise((resolve,reject)=>{let raw=''; req.on('data', chunk=>{raw += chunk; if(raw.length > 1_000_000){reject(new Error('Request body too large')); req.destroy();}}); req.on('end',()=>{try{resolve(raw ? JSON.parse(raw) : {});}catch{reject(new Error('Invalid JSON body'));}}); req.on('error',reject);}); }
function safeString(v, max=120) { return typeof v === 'string' ? v.trim().slice(0,max) : ''; }
function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function routeApi(req,res,url) {
  if(req.method==='GET' && url.pathname==='/api/health') return send(res,200,{status:'ok',service:'ShopSphere API',time:new Date().toISOString()});
  if(req.method==='GET' && url.pathname==='/api/products') {
    const all=readJson('products.json'); const q=(url.searchParams.get('q')||'').trim().toLowerCase(); const category=url.searchParams.get('category')||'All';
    const min=Math.max(0,Number(url.searchParams.get('min')||0)); const max=Number(url.searchParams.get('max')||Number.MAX_SAFE_INTEGER);
    let items=all.filter(p=>(!q || (p.name+' '+p.category+' '+p.description).toLowerCase().includes(q)) && (category==='All'||p.category===category) && p.price>=min && p.price<=max);
    const sort=url.searchParams.get('sort')||'featured'; if(sort==='price-low') items.sort((a,b)=>a.price-b.price); if(sort==='price-high') items.sort((a,b)=>b.price-a.price); if(sort==='rating') items.sort((a,b)=>b.rating-a.rating);
    return send(res,200,{items,total:items.length,categories:['All',...new Set(all.map(p=>p.category))]});
  }
  if(req.method==='GET' && url.pathname.startsWith('/api/products/')) {
    const id=url.pathname.split('/').pop(); const product=readJson('products.json').find(p=>p.id===id); return product ? send(res,200,{item:product}) : send(res,404,{error:'Product not found'});
  }
  if(req.method==='POST' && url.pathname==='/api/orders') return bodyJson(req).then(body=>{
    const customer=body.customer||{}; const name=safeString(customer.name,100); const email=safeString(customer.email,160); const phone=safeString(customer.phone,24); const address=safeString(customer.address,300); const city=safeString(customer.city,80); const pin=safeString(customer.pin,10);
    if(name.length<2 || !validEmail(email) || phone.replace(/\D/g,'').length<10 || address.length<5 || city.length<2 || !/^\d{6}$/.test(pin)) return send(res,400,{error:'Please provide a valid name, email, 10-digit phone, address, city and 6-digit PIN code.'});
    if(!Array.isArray(body.items)||body.items.length===0) return send(res,400,{error:'Your cart is empty.'});
    const catalog=readJson('products.json'); const lines=[];
    for(const line of body.items){ const product=catalog.find(p=>p.id===line.id); const qty=Number(line.quantity); if(!product || !Number.isInteger(qty)||qty<1||qty>20) return send(res,400,{error:'Cart contains an invalid product or quantity.'}); lines.push({id:product.id,name:product.name,unitPrice:product.price,quantity:qty,lineTotal:product.price*qty}); }
    const subtotal=lines.reduce((s,x)=>s+x.lineTotal,0); const shipping=subtotal>=1500?0:79; const order={id:'SS-'+crypto.randomBytes(4).toString('hex').toUpperCase(),createdAt:new Date().toISOString(),status:'Confirmed (Demo)',paymentMethod:'Cash on delivery (demo)',customer:{name,email,phone,address,city,pin},items:lines,subtotal,shipping,total:subtotal+shipping};
    const orders=readJson('orders.json'); orders.unshift(order); writeJson('orders.json',orders); return send(res,201,{message:'Demo order placed successfully',order});
  }).catch(err=>send(res,400,{error:err.message==='Invalid JSON body'?err.message:'Could not process order'}));
  if(req.method==='GET' && url.pathname==='/api/orders') return send(res,200,{items:readJson('orders.json').map(({customer, ...order})=>({...order,customer:{name:customer.name,city:customer.city}}))});
  return send(res,404,{error:'API route not found'});
}
const server=http.createServer((req,res)=>{
  const url=new URL(req.url,'http://localhost');
  if(url.pathname.startsWith('/api/')) return routeApi(req,res,url);
  if(req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405,{'Content-Type':'text/plain; charset=utf-8','Allow':'GET, HEAD'}); return res.end('Method not allowed');}
  let pathname=decodeURIComponent(url.pathname); if(pathname==='/') pathname='/index.html';
  const file=path.resolve(PUBLIC,'.'+pathname); if(!file.startsWith(PUBLIC+path.sep) && file!==PUBLIC) {res.writeHead(403);return res.end('Forbidden');}
  fs.readFile(file,(err,content)=>{if(err){res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});return res.end('Page not found');} res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':path.extname(file)==='.html'?'no-cache':'public, max-age=3600'}); if(req.method==='HEAD') return res.end(); res.end(content);});
});
server.listen(PORT,HOST,()=>console.log(`ShopSphere running at http://${HOST}:${PORT}`));
module.exports={server};
