/**
 * Функция для расчета выручки*/
/**
 *@param purchase запись о покупке
 *@param _product карточка товара
 *@returns {number}
 */
function calculateSimpleRevenue(purchaseItem, _product) {
  const { quantity, discount, sale_price } = purchaseItem;
  const discountFactor = 1 - discount / 100;
  return sale_price * quantity * discountFactor;
}
// @TODO: Расчет выручки от операции

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
  if (index === 0) return seller.profit * 0.15;
  if (index === 1 || index === 2) return seller.profit * 0.1;
  if (index === total - 1) return 0;
  return seller.profit * 0.05;
  // @TODO: Расчет бонуса от позиции в рейтинге
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) {
  // @TODO: Проверка входных данных
  if (!data) throw new Error("Нет входных данных");
  if (!Array.isArray(data.sellers)) throw new Error("Нет массива sellers");
  if (!Array.isArray(data.products)) throw new Error("Нет массива products");
  if (!Array.isArray(data.purchase_records))
    throw new Error("Нет массива purchase_records");
  if (data.sellers.length === 0) throw new Error("Пустой массив sellers");
  if (data.products.length === 0) throw new Error("Пустой массив products");
  if (data.purchase_records.length === 0)
    throw new Error("Пустой массив purchase_records");
  // @TODO: Проверка наличия опций
  const { calculateRevenue, calculateBonus } = options || {};
  if (
    !options ||
    typeof options.calculateRevenue !== "function" ||
    typeof options.calculateBonus !== "function"
  ) {
    throw new Error("Не переданы функции для расчётов");
  }
  // @TODO: Подготовка промежуточных данных для сбора статистики
  const sellerStats = data.sellers.map((seller) => ({
    id: seller.id,
    name: `${seller.first_name} ${seller.last_name}`,
    products_sold: {},
    profit: 0,
    sales_count: 0,
    revenue: 0,
  }));
  // @TODO: Индексация продавцов и товаров для быстрого доступа
  const sellerIndex = Object.fromEntries(sellerStats.map((s) => [s.id, s]));
  const productIndex = Object.fromEntries(data.products.map((p) => [p.sku, p]));
  // @TODO: Расчет выручки и прибыли для каждого продавца
  data.purchase_records.forEach((record) => {
    const seller = sellerIndex[record.seller_id];
    if (!seller) return;

    seller.sales_count += 1;

    record.items.forEach((item) => {
      const product = productIndex[item.sku];
      if (!product) return;

      const revenue = +calculateRevenue(item, product).toFixed(2);
      const cost = +(product.purchase_price * item.quantity).toFixed(2);
      const profit = +(revenue - cost).toFixed(2);

      seller.revenue = +(seller.revenue + revenue).toFixed(2);
      seller.profit = +(seller.profit + profit).toFixed(2);

      if (!seller.products_sold[item.sku]) {
        seller.products_sold[item.sku] = 0;
      }
      seller.products_sold[item.sku] += item.quantity;
    });
  });
  // @TODO: Сортировка продавцов по прибыли
  sellerStats.sort((a, b) => b.profit - a.profit);
  // @TODO: Назначение премий на основе ранжирования
  sellerStats.forEach((seller, index) => {
    seller.bonus = calculateBonus(index, sellerStats.length, seller);

    seller.top_products = Object.entries(seller.products_sold)
      .map(([sku, quantity]) => ({ sku, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);
  });
  // @TODO: Подготовка итоговой коллекции с нужными полями
  return sellerStats.map((seller) => {
    return {
      seller_id: seller.id,
      name: seller.name,
      revenue: seller.revenue,
      profit: seller.profit,
      sales_count: seller.sales_count,
      top_products: seller.top_products,
      bonus: +seller.bonus.toFixed(2),
    };
  });
}
