const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS — разрешаем запросы с любого домена
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { subject, answers_text, date_time } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.mail.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // HTML-таблица с ответами
    const questions = [
      'Врачи и медсестры понятно объясняли состояние ребёнка, план ухода и лечение',
      'Насколько комфортным для Вас было пребывание в отделении?',
      'Что сделало бы Ваше пребывание заметно комфортнее?',
      'Относился ли персонал к Вам и Вашему ребёнку с заботой и уважением?',
      'Как бы Вы оценили уровень шума в отделении?',
      'Насколько Вы чувствовали эмоциональную поддержку со стороны медицинского персонала?',
      'Что лично для Вас было самым важным в эмоциональной поддержке (или чего не хватало)?',
      'Общая атмосфера в отделении была спокойной и вызывала доверие?',
      'С какой неонатальной медицинской сестрой Вы чувствовали себя более комфортно и спокойно?',
      'Насколько Вы остались довольны тем, как прошла выписка?',
      'Что мы делаем лучше всего? Что Вам особенно запомнилось?',
      'Если бы Вы могли изменить одну вещь — что бы это было?',
      'Что нам следует изменить или улучшить в нашей работе?'
    ];

    const parsed = req.body.answers || {};
    const rows = questions.map((q, i) => {
      const val = parsed[`q${i+1}`] || '—';
      const bg = i % 2 === 0 ? '#faf7f2' : '#ffffff';
      return `<tr style="background:${bg}">
        <td style="padding:10px 14px;font-size:12px;color:#4e7264;font-weight:600;width:28px;vertical-align:top">${i+1}</td>
        <td style="padding:10px 14px;font-size:13px;color:#4a3e38;font-weight:500;vertical-align:top">${q}</td>
        <td style="padding:10px 14px;font-size:13px;color:#2a2420;vertical-align:top">${val}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f5f2ed;font-family:Arial,sans-serif;">
<div style="max-width:680px;margin:24px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#4e7264,#7a9e8e);padding:28px 32px;">
    <div style="font-size:24px;margin-bottom:8px;">🌸</div>
    <div style="color:#fff;font-size:18px;font-weight:300;">Анкета качества — Отделение новорождённых</div>
    <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:6px;">${date_time} · Анонимно</div>
  </div>
  <div style="padding:0 24px 24px;">
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead><tr style="background:#e8f0ec;">
        <th style="padding:10px 14px;font-size:11px;color:#4e7264;text-align:left">#</th>
        <th style="padding:10px 14px;font-size:11px;color:#4e7264;text-align:left">ВОПРОС</th>
        <th style="padding:10px 14px;font-size:11px;color:#4e7264;text-align:left">ОТВЕТ</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="background:#faf7f2;padding:16px 32px;font-size:11px;color:#aaa;text-align:center;border-top:1px solid #e8e0d8;">
    Отправлено автоматически · Отделение новорождённых
  </div>
</div></body></html>`;

    await transporter.sendMail({
      from: `"Анкета ХНВ" <${process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL,
      subject: subject || `Анкета качества — Отделение новорождённых — ${date_time}`,
      html: html,
      text: answers_text || ''
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('SMTP error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
}
