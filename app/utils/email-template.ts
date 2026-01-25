// app/utils/email-template.ts
type EmailTemplateParams = {
  title: string;
  preheader?: string;
  headline: string;
  bodyHtml: string; // aquí metes <p>...</p>
  ctaText?: string;
  ctaUrl?: string;
  footerText?: string;

  // opcional por si algún día quieres imagen, pero por defecto NO usamos foto
  heroImageUrl?: string;
};

export function buildStratosfereEmailHtml({
  title,
  preheader = "",
  headline,
  bodyHtml,
  ctaText,
  ctaUrl,
  heroImageUrl,
  footerText = "© 2026 Stratosfere — SF Urban S.L. (CIF B-75965723)",
}: EmailTemplateParams) {
  const appUrl = "https://stratosfere.com";

  const safePreheader = preheader
    ? preheader.replace(/</g, "&lt;").replace(/>/g, "&gt;")
    : "";

  const brandWordmark = `
    <div style="margin:0 0 18px 0;">
      <div style="
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
        font-size:32px;
        font-weight:900;
        letter-spacing:-1.2px;
        line-height:1;
        color:#000000;">
        Stratosfere OS<span style="font-weight:900;">.</span>
      </div>
    </div>
  `;

  const hero = heroImageUrl
    ? `
      <tr>
        <td style="padding:0 0 18px 0;">
          <img src="${heroImageUrl}" width="560" alt="Stratosfere" style="display:block;width:100%;max-width:560px;border:0;border-radius:18px;" />
        </td>
      </tr>
    `
    : "";

  const cta = ctaText && ctaUrl
    ? `
      <tr>
        <td align="center" style="padding:18px 0 0 0;">
          <!--[if mso]>
          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${ctaUrl}" style="height:48px;v-text-anchor:middle;width:260px;" arcsize="50%" strokecolor="#111111" fillcolor="#111111">
            <w:anchorlock/>
            <center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">
              ${ctaText}
            </center>
          </v:roundrect>
          <![endif]-->
          <!--[if !mso]><!-- -->
          <a href="${ctaUrl}" style="
            display:inline-block;
            background:#111111;
            color:#ffffff;
            text-decoration:none;
            padding:14px 22px;
            border-radius:999px;
            font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
            font-size:14px;
            font-weight:700;
            letter-spacing:-0.2px;">
            ${ctaText}
          </a>
          <!--<![endif]-->
        </td>
      </tr>
    `
    : "";

  return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F5F5F7;">
  ${safePreheader ? `
  <div style="display:none!important;max-height:0;max-width:0;overflow:hidden;opacity:0;color:transparent;height:0;width:0;">
    ${safePreheader}
  </div>` : ""}

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F5F5F7;">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;">
          <tr>
            <td style="
              background:#ffffff;
              border-radius:28px;
              padding:28px 22px;
              border:1px solid #EFEFF2;">
              ${brandWordmark}

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                ${hero}
                <tr>
                  <td style="
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                    font-size:22px;
                    font-weight:800;
                    letter-spacing:-0.6px;
                    color:#000000;
                    padding:0 0 10px 0;">
                    ${headline}
                  </td>
                </tr>

                <tr>
                  <td style="
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                    font-size:14px;
                    line-height:1.65;
                    color:#2b2b2b;">
                    ${bodyHtml}
                  </td>
                </tr>

                ${cta}

                <tr>
                  <td style="padding:22px 0 0 0;">
                    <div style="height:1px;background:#EFEFF2;width:100%;"></div>
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:14px 0 0 0;
                    font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
                    font-size:11px;
                    line-height:1.6;
                    color:#8a8a8f;">
                    ${footerText}<br/>
                    <a href="${appUrl}/terms" style="color:#8a8a8f;text-decoration:underline;">Términos</a> ·
                    <a href="${appUrl}/privacy" style="color:#8a8a8f;text-decoration:underline;">Privacidad</a> ·
                    <a href="${appUrl}/refunds" style="color:#8a8a8f;text-decoration:underline;">Reembolsos</a>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <tr>
            <td align="center" style="
              padding:14px 10px 0 10px;
              font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;
              font-size:11px;
              color:#9a9aa0;">
              Si no reconoces este correo, puedes ignorarlo.
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
