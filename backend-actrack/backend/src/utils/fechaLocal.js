// Las columnas de fecha de este proyecto son TIMESTAMP (sin zona horaria).
// Postgres/node-postgres las guarda tal cual los números que se le manden,
// pero al LEERLAS de vuelta, node-postgres arma el objeto Date
// interpretando esos números como hora LOCAL de la máquina. El problema:
// cualquier GET regresa un string con "Z" (JSON.stringify de un Date
// siempre es UTC) -- si ese mismo string se vuelve a mandar tal cual en
// un PUT (el patrón normal de "cargar la orden, resender todo"), Postgres
// lo guarda como si esos números YA fueran la hora correcta, y la
// siguiente lectura los vuelve a interpretar como local -- resultado:
// se corre 6h (nuestra zona, UTC-6) cada vez que se re-guarda sin tocar
// la fecha. Se confirmó compuesto (00:30 -> 06:30 -> 12:30) probando en
// vivo. Esta función normaliza CUALQUIER entrada (con o sin "Z") a la
// hora local real, así el guardado es idempotente sin importar qué
// formato mande el frontend.
export const aFechaSinZona = (valor) => {
    if (!valor) return null;
    const d = new Date(valor);
    if (Number.isNaN(d.getTime())) return null;
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
};
