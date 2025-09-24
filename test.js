const resultado = 0.1 + 0.2;
console.log('Resultado normal:', resultado);

import Decimal from 'decimal.js';

const a = new Decimal('0.1');
const b = new Decimal('0.2');
const resultado2 = a.plus(b);
a.plus(b);       // Suma → 12.75
a.minus(b);      // Resta → 8.25
a.times(b);      // Multiplicación → 23.625
a.div(b);        // División → 4.666666...

console.log('Resultado con decimal.js:', resultado2.toString()); // ✅ 0.3
