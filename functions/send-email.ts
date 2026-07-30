import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

interface Task {
  id: string;
  title: string;
  completed: boolean;
}

const ses = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to, tasks } = req.body as { to: string; tasks: Task[] };

  if (!to || !tasks) {
    return res.status(400).json({ error: 'Faltan parámetros: to y tasks' });
  }

  const completed = tasks.filter((t) => t.completed);
  const pending = tasks.filter((t) => !t.completed);

  const taskRow = (t: Task) => `<li>${t.title}</li>`;

  const htmlBody = `
    <h2>📋 Resumen de tus tareas</h2>
    <p><strong>Total:</strong> ${tasks.length} tareas</p>

    <h3>✅ Completadas (${completed.length})</h3>
    <ul>${completed.length > 0 ? completed.map(taskRow).join('') : '<li>Ninguna</li>'}</ul>

    <h3>⏳ Pendientes (${pending.length})</h3>
    <ul>${pending.length > 0 ? pending.map(taskRow).join('') : '<li>¡Todo listo!</li>'}</ul>

    <hr/>
    <small>Generado por Gestor estratégico de tareas — PIM4</small>
  `;

  const command = new SendEmailCommand({
    Source: process.env.SES_FROM_EMAIL!,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: '📋 Resumen de tus tareas — Gestor estratégico de tareas' },
      Body: { Html: { Data: htmlBody } },
    },
  });

  try {
    await ses.send(command);
    return res.status(200).json({ success: true, message: 'Email enviado correctamente' });
  } catch (error) {
    console.error('SES Error:', error);
    return res.status(500).json({ error: 'Error al enviar el email' });
  }
}
