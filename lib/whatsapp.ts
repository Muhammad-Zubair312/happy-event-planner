// lib/whatsapp.ts

type ProductLike = { name: string; price: number };

export function buildWhatsAppURL(
  productOrName: ProductLike | string,
  priceOrQty?: number,
  qty = 1
): string {
  // Read INSIDE the function — never at module level
  // This guarantees Android gets the real number, not a stale bundled constant
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '923054390254';

  let name: string;
  let price: number;
  let quantity: number;

  if (typeof productOrName === 'string') {
    // buildWhatsAppURL('Product Name', 1500, 2)
    name     = productOrName;
    price    = priceOrQty ?? 0;
    quantity = qty;
  } else {
    // buildWhatsAppURL(product)  or  buildWhatsAppURL(product, 3)
    name     = productOrName.name;
    price    = productOrName.price;
    quantity = priceOrQty ?? 1;
  }

  const msg =
    `Hello! I want to order:\n\n` +
    `Product: ${name}\n` +
    `Quantity: ${quantity}\n` +
    `Price: PKR ${(price * quantity).toLocaleString()}\n\n` +
    `Please confirm availability and delivery to Lahore.`;

  return `https://wa.me/${number}?text=${encodeURIComponent(msg)}`;
}