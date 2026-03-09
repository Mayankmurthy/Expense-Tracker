/**
 * Identifies potential subscriptions from a list of expenses.
 * A subscription is defined as an expense with the same title and amount
 * that appears in at least 2 different months.
 */
export const detectSubscriptions = (expenses) => {
  const groups = {};

  expenses.forEach(exp => {
    const key = `${exp.title.toLowerCase()}_${exp.amount}`;
    if (!groups[key]) {
      groups[key] = {
        title: exp.title,
        amount: exp.amount,
        category: exp.category,
        dates: [],
        count: 0
      };
    }
    groups[key].dates.push(new Date(exp.date));
    groups[key].count += 1;
  });

  return Object.values(groups).filter(group => {
    // Check if it appears in at least 2 different months/years
    if (group.count < 2) return false;
    
    const months = new Set(group.dates.map(d => `${d.getFullYear()}-${d.getMonth()}`));
    return months.size >= 2;
  });
};

export const calculateYearlyCost = (monthlyAmount) => {
  return monthlyAmount * 12;
};
