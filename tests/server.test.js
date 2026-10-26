'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const http = require('node:http');
const zlib = require('node:zlib');
const {once} = require('node:events');
const {createServer} = require('../serve');

async function fixture(t, options = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'recipe-server-'));
  const root = path.join(directory, 'site'); fs.mkdirSync(root);
  fs.writeFileSync(path.join(root, 'index.html'), '<!doctype html><h1>Recipe Finder</h1>'.repeat(30));
  fs.writeFileSync(path.join(root, 'app.js'), 'const recipes = ["tomato", "rice"];\n'.repeat(30));
  fs.writeFileSync(path.join(root, 'style.css'), 'body { color: green; }\n'.repeat(30));
  fs.writeFileSync(path.join(root, 'data.json'), JSON.stringify({recipes:['rice','tomato']}));
  fs.writeFileSync(path.join(root, 'art.svg'), '<svg xmlns="http://www.w3.org/2000/svg"><circle r="20"/></svg>');
  fs.writeFileSync(path.join(root, 'notes.txt'), 'A useful kitchen note.\n'.repeat(10));
  fs.writeFileSync(path.join(root, 'font.woff2'), Buffer.from([119,79,70,50,0,1,2,3,4,5]));
  fs.writeFileSync(path.join(root, 'photo.png'), Buffer.from([137,80,78,71,13,10,26,10]));
  fs.writeFileSync(path.join(directory, 'secret.txt'), 'outside secret');
  fs.symlinkSync(path.join(directory, 'secret.txt'), path.join(root, 'outside.txt'));
  const server = createServer({root, ...options});
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(async () => { await new Promise(resolve => server.close(resolve)); fs.rmSync(directory,{recursive:true,force:true}); });
  function request(target = '/', headers = {}, method = 'GET') {
    return new Promise((resolve, reject) => {
      const req = http.request({hostname:'127.0.0.1',port:server.address().port,path:target,method,headers,agent:false}, res => {
        const chunks=[]; res.on('data', chunk=>chunks.push(chunk));
        res.on('end', ()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
        res.on('error',reject);
      });
      req.on('error',reject); req.end();
    });
  }
  return {root, server, request};
}

test('text assets gzip correctly with byte-accurate lengths and encoding-aware revalidation', async t => {
  const {root,request} = await fixture(t);
  for(const file of ['index.html','app.js','style.css','data.json','art.svg','notes.txt']) {
    const response = await request('/'+file, {'Accept-Encoding':'gzip, br'});
    assert.equal(response.status,200,file);
    assert.equal(response.headers['content-encoding'],'gzip',file);
    assert.equal(response.headers.vary,'Accept-Encoding');
    assert.equal(Number(response.headers['content-length']),response.body.length);
    assert.equal(response.headers['cache-control'],'no-cache');
    assert.deepEqual(zlib.gunzipSync(response.body),fs.readFileSync(path.join(root,file)));
    const unchanged = await request('/'+file, {'Accept-Encoding':'gzip','If-None-Match':response.headers.etag});
    assert.equal(unchanged.status,304); assert.equal(unchanged.body.length,0);
    assert.equal(unchanged.headers.etag,response.headers.etag);
    const identity=await request('/'+file, {'If-None-Match':response.headers.etag});
    assert.equal(identity.status,200,'gzip tag does not validate identity bytes');
    assert.notEqual(identity.headers.etag,response.headers.etag);
  }
});
test('HEAD has GET representation headers but no body, including gzip and 304', async t => {
  const {request}=await fixture(t);
  for(const encoding of ['gzip','identity']) {
    const get=await request('/',{'Accept-Encoding':encoding});
    const head=await request('/',{'Accept-Encoding':encoding},'HEAD');
    assert.equal(head.status,200);assert.equal(head.body.length,0);
    for(const key of ['content-type','content-length','content-encoding','vary','etag']) assert.equal(head.headers[key],get.headers[key],key);
    const cached=await request('/',{'Accept-Encoding':encoding,'If-None-Match':get.headers.etag},'HEAD');
    assert.equal(cached.status,304);assert.equal(cached.body.length,0);
  }
});
test('WOFF2 and PNG retain their correct content types and raw bytes', async t => {
  const {root,request}=await fixture(t);
  for(const [file,type] of [['font.woff2','font/woff2'],['photo.png','image/png']]) {
    const response=await request('/'+file,{'Accept-Encoding':'gzip'});
    assert.equal(response.headers['content-type'],type);
    assert.equal(response.headers['content-encoding'],undefined);
    assert.deepEqual(response.body,fs.readFileSync(path.join(root,file)));
    assert.equal(Number(response.headers['content-length']),response.body.length);
  }
});
test('changed file contents invalidate cache even when byte length is unchanged', async t => {
  const {root,request}=await fixture(t);
  const before=await request('/data.json',{'Accept-Encoding':'gzip'});
  const file=path.join(root,'data.json'),old=fs.readFileSync(file,'utf8');
  fs.writeFileSync(file,old.replace('rice','bean'));
  const future=new Date(Date.now()+1000);fs.utimesSync(file,future,future);
  const after=await request('/data.json',{'Accept-Encoding':'gzip','If-None-Match':before.headers.etag});
  assert.equal(after.status,200);assert.notEqual(after.headers.etag,before.headers.etag);
  assert.ok(zlib.gunzipSync(after.body).toString().includes('bean'));
});
test('compression respects explicit refusal and weak or multiple conditional tags', async t => {
  const {request}=await fixture(t);
  const plain=await request('/',{'Accept-Encoding':'gzip;q=0, *;q=1'});
  assert.equal(plain.headers['content-encoding'],undefined);
  const cached=await request('/',{'If-None-Match':'"other", W/'+plain.headers.etag});
  assert.equal(cached.status,304);
  assert.equal((await request('/font.woff2',{'Accept-Encoding':'identity;q=0, gzip;q=1'})).status,406);
});
test('invalid paths, traversal, outside symlinks, missing files and methods fail safely', async t => {
  const {request}=await fixture(t);
  for(const target of ['/../secret.txt','/%2e%2e/secret.txt','/outside.txt']) {
    const response=await request(target);assert.equal(response.status,403,target);assert.ok(!response.body.toString().includes('outside secret'));
  }
  assert.equal((await request('/%zz')).status,400);
  assert.equal((await request('/bad%00file')).status,400);
  assert.equal((await request('/missing')).status,404);
  const post=await request('/',{},'POST');assert.equal(post.status,405);assert.equal(post.headers.allow,'GET, HEAD');
  const head=await request('/missing',{},'HEAD');assert.equal(head.status,404);assert.equal(head.body.length,0);
});
test('body cache stays bounded and large responses stream without a false compressed length', async t => {
  const {request,server}=await fixture(t,{cacheLimitBytes:1500,maxEntryBytes:800});
  for(const file of ['data.json','art.svg','notes.txt','style.css','app.js']) await request('/'+file,{'Accept-Encoding':'gzip'});
  assert.ok(server.cacheInfo().bytes<=1500);
  const large=await request('/index.html',{'Accept-Encoding':'gzip'});
  assert.equal(large.status,200);assert.equal(large.headers['content-length'],undefined);
  assert.match(zlib.gunzipSync(large.body).toString(),/Recipe Finder/);
  const head=await request('/index.html',{'Accept-Encoding':'gzip'},'HEAD');
  assert.equal(head.body.length,0);assert.equal(head.headers.etag,large.headers.etag);
});
