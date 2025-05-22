import sgMail from '@sendgrid/mail';
import type { Order, OrderItem, Product, User } from '@shared/schema';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

interface OrderEmailData {
  order: Order;
  orderItems: (OrderItem & { product: Product })[];
  user: User;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<boolean> {
  try {
    const { order, orderItems, user } = data;
    
    // Generate order items HTML
    const orderItemsHtml = orderItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px; border-right: 1px solid #eee;">
          <strong>${item.product.name}</strong>
        </td>
        <td style="padding: 12px; text-align: center; border-right: 1px solid #eee;">
          ${item.quantity}
        </td>
        <td style="padding: 12px; text-align: right; border-right: 1px solid #eee;">
          ${item.product.price.toFixed(2)} лв.
        </td>
        <td style="padding: 12px; text-align: right;">
          ${(item.product.price * item.quantity).toFixed(2)} лв.
        </td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Потвърждение на поръчка - SportZone</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🏃‍♂️ SportZone</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Спортни стоки и екипировка</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0 0 15px 0;">✅ Поръчката ви е потвърдена!</h2>
          <p style="margin: 0; font-size: 16px;">Здравейте <strong>${user.firstName || user.username}</strong>,</p>
          <p style="margin: 10px 0 0 0;">Благодарим ви за поръчката! Ето детайлите:</p>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">📋 Детайли на поръчката</h3>
          <table style="width: 100%; margin-bottom: 15px;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Номер на поръчка:</td>
              <td style="padding: 8px 0; text-align: right;">#${order.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Дата:</td>
              <td style="padding: 8px 0; text-align: right;">${new Date(order.createdAt).toLocaleDateString('bg-BG')}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Статус:</td>
              <td style="padding: 8px 0; text-align: right;">
                <span style="background: #22c55e; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
                  ${order.status}
                </span>
              </td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">🛒 Поръчани продукти</h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-right: 1px solid #ddd;">Продукт</th>
                <th style="padding: 12px; text-align: center; border-right: 1px solid #ddd;">Кол.</th>
                <th style="padding: 12px; text-align: right; border-right: 1px solid #ddd;">Цена</th>
                <th style="padding: 12px; text-align: right;">Общо</th>
              </tr>
            </thead>
            <tbody>
              ${orderItemsHtml}
            </tbody>
            <tfoot>
              <tr style="background: #f8f9fa; font-weight: bold;">
                <td colspan="3" style="padding: 12px; text-align: right; border-top: 2px solid #2563eb;">
                  Общо за плащане:
                </td>
                <td style="padding: 12px; text-align: right; border-top: 2px solid #2563eb; color: #2563eb; font-size: 18px;">
                  ${order.total.toFixed(2)} лв.
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div style="margin-bottom: 20px;">
          <h3 style="color: #333; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">🚚 Адрес за доставка</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 6px;">
            <p style="margin: 0; line-height: 1.5;">
              <strong>${user.firstName || ''} ${user.lastName || ''}</strong><br>
              ${order.address}<br>
              ${order.city}<br>
              Телефон: ${order.phone}
            </p>
          </div>
        </div>

        <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #2563eb; margin: 0 0 10px 0;">ℹ️ Информация за доставката</h3>
          <p style="margin: 0; color: #555;">
            • Очаквайте вашата поръчка в рамките на 2-3 работни дни<br>
            • Ще получите SMS уведомление при изпращане<br>
            • При въпроси се свържете с нас на info@sportzone.bg
          </p>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; margin: 0;">
            Благодарим ви, че избрахте SportZone! 🏆<br>
            <a href="mailto:info@sportzone.bg" style="color: #2563eb;">info@sportzone.bg</a> | 
            <a href="tel:+359888123456" style="color: #2563eb;">+359 888 123 456</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const emailText = `
SportZone - Потвърждение на поръчка

Здравейте ${user.firstName || user.username},

Благодарим ви за поръчката! Ето детайлите:

Номер на поръчка: #${order.id}
Дата: ${new Date(order.createdAt).toLocaleDateString('bg-BG')}
Статус: ${order.status}

Поръчани продукти:
${orderItems.map(item => `- ${item.product.name} x ${item.quantity} = ${(item.product.price * item.quantity).toFixed(2)} лв.`).join('\n')}

Общо за плащане: ${order.total.toFixed(2)} лв.

Адрес за доставка:
${user.firstName || ''} ${user.lastName || ''}
${order.address}
${order.city}
Телефон: ${order.phone}

Очаквайте вашата поръчка в рамките на 2-3 работни дни.

Благодарим ви, че избрахте SportZone!
info@sportzone.bg | +359 888 123 456
    `;

    const msg = {
      to: user.email!,
      from: 'noreply@sportzone.bg', // Можеш да смениш това с твоя домейн
      subject: `✅ Потвърждение на поръчка #${order.id} - SportZone`,
      text: emailText,
      html: emailHtml,
    };

    await sgMail.send(msg);
    console.log(`[email] Order confirmation sent to ${user.email} for order #${order.id}`);
    return true;
  } catch (error) {
    console.error('[email] Failed to send order confirmation:', error);
    return false;
  }
}

export async function sendOrderStatusUpdateEmail(
  user: User, 
  order: Order, 
  oldStatus: string, 
  newStatus: string
): Promise<boolean> {
  try {
    const statusEmoji = {
      'pending': '⏳',
      'confirmed': '✅',
      'shipped': '🚚',
      'delivered': '📦',
      'cancelled': '❌'
    };

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Обновление на поръчка - SportZone</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0; font-size: 28px;">🏃‍♂️ SportZone</h1>
          <p style="color: #666; margin: 5px 0 0 0;">Спортни стоки и екипировка</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin: 0 0 15px 0;">${statusEmoji[newStatus as keyof typeof statusEmoji] || '📋'} Обновление на поръчката</h2>
          <p style="margin: 0; font-size: 16px;">Здравейте <strong>${user.firstName || user.username}</strong>,</p>
          <p style="margin: 10px 0 0 0;">Има обновление за вашата поръчка #${order.id}:</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #e7f3ff; padding: 20px; border-radius: 8px; display: inline-block;">
            <p style="margin: 0; font-size: 18px;">
              Статус променен от <strong style="color: #666;">${oldStatus}</strong>
            </p>
            <div style="margin: 15px 0; font-size: 30px;">⬇️</div>
            <p style="margin: 0; font-size: 20px;">
              на <strong style="color: #2563eb; font-size: 24px;">${newStatus}</strong>
            </p>
          </div>
        </div>

        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #666; margin: 0;">
            При въпроси се свържете с нас:<br>
            <a href="mailto:info@sportzone.bg" style="color: #2563eb;">info@sportzone.bg</a> | 
            <a href="tel:+359888123456" style="color: #2563eb;">+359 888 123 456</a>
          </p>
        </div>
      </body>
      </html>
    `;

    const msg = {
      to: user.email!,
      from: 'noreply@sportzone.bg',
      subject: `📋 Обновление на поръчка #${order.id} - SportZone`,
      html: emailHtml,
    };

    await sgMail.send(msg);
    console.log(`[email] Status update sent to ${user.email} for order #${order.id}: ${oldStatus} -> ${newStatus}`);
    return true;
  } catch (error) {
    console.error('[email] Failed to send status update:', error);
    return false;
  }
}