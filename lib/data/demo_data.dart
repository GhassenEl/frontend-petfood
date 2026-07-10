class MoneyTx {
  MoneyTx({
    required this.id,
    required this.title,
    required this.amount,
    required this.type,
    required this.category,
    required this.date,
  });
  final String id;
  final String title;
  final double amount;
  final String type; // income | expense
  final String category;
  final DateTime date;

  bool get isIncome => type == 'income';
}

const expenseCategories = [
  'Alimentation',
  'Transport',
  'Logement',
  'Santé',
  'Loisirs',
  'Shopping',
  'Autres',
];

const incomeCategories = [
  'Salaire',
  'Freelance',
  'Investissement',
  'Cadeau',
  'Autres',
];

final initialTransactions = <MoneyTx>[
  MoneyTx(id: 'TX-201', title: 'Salaire juillet', amount: 2800, type: 'income', category: 'Salaire', date: DateTime(2026, 7, 1)),
  MoneyTx(id: 'TX-202', title: 'Courses Carrefour', amount: 186.5, type: 'expense', category: 'Alimentation', date: DateTime(2026, 7, 2)),
  MoneyTx(id: 'TX-203', title: 'Essence', amount: 75, type: 'expense', category: 'Transport', date: DateTime(2026, 7, 3)),
  MoneyTx(id: 'TX-204', title: 'Loyer', amount: 650, type: 'expense', category: 'Logement', date: DateTime(2026, 7, 5)),
  MoneyTx(id: 'TX-205', title: 'Mission freelance', amount: 420, type: 'income', category: 'Freelance', date: DateTime(2026, 7, 6)),
  MoneyTx(id: 'TX-206', title: 'Cinéma', amount: 28, type: 'expense', category: 'Loisirs', date: DateTime(2026, 7, 7)),
  MoneyTx(id: 'TX-207', title: 'Pharmacie', amount: 42.3, type: 'expense', category: 'Santé', date: DateTime(2026, 7, 7)),
  MoneyTx(id: 'TX-208', title: 'Vêtements', amount: 95, type: 'expense', category: 'Shopping', date: DateTime(2026, 7, 8)),
];
