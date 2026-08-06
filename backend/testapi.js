const app = require('./src/app');
const server = app.listen(0, async () => {
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  try {
    // login as admin
    let res = await fetch(base + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ usuario:'admin.rubato01', password:'Rubato.2026*', roleRequested:'ADMIN' }) });
    let data = await res.json();
    console.log('LOGIN:', res.status, JSON.stringify(data).slice(0,200));
    const cookies = res.headers.get('set-cookie');
    console.log('COOKIE:', cookies);
    const cookie = cookies.split(';')[0];
    // get class students
    res = await fetch(base + '/api/classes/101/students', { headers:{ Cookie: cookie } });
    console.log('GET students 101:', res.status, (await res.text()).slice(0,200));
    // delete student 5 from class 101
    res = await fetch(base + '/api/classes/101/students/5', { method:'DELETE', headers:{ Cookie: cookie } });
    console.log('DELETE 101/5:', res.status, (await res.text()).slice(0,300));
  } catch (e) { console.error('ERR:', e.message); }
  server.close();
});
