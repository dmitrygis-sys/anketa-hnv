const nodemailer = require('nodemailer');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { subject, answers, answers_text, date_time } = req.body;

    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const questions = [
      'Врачи и медсестры понятно объясняли состояние ребёнка, план ухода и лечение',
      'Насколько комфортным для Вас было пребывание в отделении?',
      'Что сделало бы Ваше пребывание заметно комфортнее?',
      'Относился ли персонал к Вам и Вашему ребёнку с заботой и уважением?',
      'Как бы Вы оценили уровень шума в отделении?',
      'Насколько Вы чувствовали эмоциональную поддержку со стороны медицинского персонала?',
      'Что лично для Вас было самым важным в эмоциональной поддержке?',
      'Общая атмосфера в отделении была спокойной и вызывала доверие?',
      'С какой неонатальной медицинской сестрой Вы чувствовали себя более комфортно?',
      'Насколько Вы остались довольны тем, как прошла выписка?',
      'Что мы делаем лучше всего?',
      'Если бы Вы могли изменить одну вещь — что бы это было?',
      'Что нам следует изменить или улучшить в нашей работе?'
    ];

    const rows = questions.map((q, i) => {
      const val = (answers && answers[`q${i+1}`]) || '\u2014';
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
    <div style="font-size:24px;margin-bottom:8px;">\uD83C\uDF38</div>
    <div style="color:#fff;font-size:18px;font-weight:300;">\u0410\u043d\u043a\u0435\u0442\u0430 \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0430 \u2014 \u041e\u0442\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u043d\u043e\u0432\u043e\u0440\u043e\u0436\u0434\u0451\u043d\u043d\u044b\u0445</div>
    <div style="color:rgba(255,255,255,0.7);font-size:12px;margin-top:6px;">${date_time} \u00b7 \u0410\u043d\u043e\u043d\u0438\u043c\u043d\u043e</div>
  </div>
  <div style="padding:0 24px 24px;">
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
      <thead><tr style="background:#e8f0ec;">
        <th style="padding:10px 14px;font-size:11px;color:#4e7264;text-align:left">#</th>
        <th style="padding:10px 14px;font-size:11px;color:#4e7264;text-align:left">\u0412\u041e\u041f\u0420\u041e\u0421</th>
        <th style="padding:10px 14px;font-size:11px;color:#4e7264;text-align:left">\u041e\u0422\u0412\u0415\u0422</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>
  <div style="background:#faf7f2;padding:16px 32px;font-size:11px;color:#aaa;text-align:center;">
    \u041e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u043e \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438 \u00b7 \u041e\u0442\u0434\u0435\u043b\u0435\u043d\u0438\u0435 \u043d\u043e\u0432\u043e\u0440\u043e\u0436\u0434\u0451\u043d\u043d\u044b\u0445
  </div>
</div></body></html>`;

    await transporter.sendMail({
      from: `"Анкета ХНВ" <${process.env.SMTP_USER}>`,
      to: process.env.TO_EMAIL,
      subject: subject || `Анкета качества — ${date_time}`,
      html,
      text: answers_text || ''
    });

    return res.status(200).json({ ok: true });

  } catch (err) {
    console.error('SMTP error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
