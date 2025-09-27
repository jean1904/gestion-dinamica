import { loginTenant, registerTenant, emailExists } from '../services/auth.service.js';

export async function loginHandler(req, res) {
  try {
    const { email, password } = req.body;
    const tenant = await loginTenant(email, password);
    res.json({ tenant });
  } catch (err) {
    console.log(err);
    res.status(401).json({ error: err.message });
  }
}

export async function registerHandler(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const alreadyExists = await emailExists({ email });

    if(alreadyExists) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }
    const tenant = await registerTenant({ name, email, password });
    res.status(201).json({ tenant });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
