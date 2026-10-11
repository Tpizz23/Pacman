import http from 'node:http';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd(),port=Number(process.env.PORT||5173);
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.json':'application/json'};
http.createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const relative=pathname==='/'?'index.html':pathname.slice(1);
    if(!['index.html','style.css'].includes(relative)&&!/^src\/[a-z-]+\.js$/.test(relative)) {res.writeHead(404);res.end('Not found');return;}
    const data=await readFile(path.join(root,relative));
    res.writeHead(200,{'Content-Type':types[path.extname(relative)]||'text/plain','Cache-Control':'no-store'});res.end(data);
  }catch{res.writeHead(404);res.end('Not found');}
}).listen(port,'0.0.0.0',()=>console.log(`Learning Pac-Man: http://localhost:${port}`));
