class BankAccount {
  BankAccount({
    required this.name,
    required this.type,
    required this.iban,
    required this.balance,
    required this.currency,
  });
  final String name;
  final String type;
  final String iban;
  int balance;
  final String currency;
}

class BankTransaction {
  BankTransaction({
    required this.id,
    required this.label,
    required this.amount,
    required this.type,
    required this.date,
    required this.status,
  });
  final String id;
  final String label;
  final int amount;
  final String type;
  final String date;
  String status;
}

class BankCard {
  BankCard({
    required this.holder,
    required this.number,
    required this.expiry,
    required this.type,
    required this.limit,
    required this.status,
  });
  final String holder;
  final String number;
  final String expiry;
  final String type;
  final int limit;
  String status;
}

final initialAccounts = <BankAccount>[
  BankAccount(name: 'Compte courant', type: 'Courant', iban: 'TN59 1234 5678 9012 3456', balance: 8420, currency: 'DT'),
  BankAccount(name: 'Épargne', type: 'Épargne', iban: 'TN59 9876 5432 1098 7654', balance: 15600, currency: 'DT'),
  BankAccount(name: 'Compte pro', type: 'Professionnel', iban: 'TN59 1122 3344 5566 7788', balance: 23150, currency: 'DT'),
];

final initialTransactions = <BankTransaction>[
  BankTransaction(id: 'TX-5501', label: 'Virement salaire', amount: 3200, type: 'Crédit', date: '17/06', status: 'Validé'),
  BankTransaction(id: 'TX-5500', label: 'Paiement ENIEG', amount: -145, type: 'Débit', date: '16/06', status: 'Validé'),
  BankTransaction(id: 'TX-5499', label: 'Virement Karim B.', amount: -500, type: 'Virement', date: '15/06', status: 'Validé'),
  BankTransaction(id: 'TX-5498', label: 'Retrait DAB Lac 1', amount: -200, type: 'Retrait', date: '14/06', status: 'Validé'),
  BankTransaction(id: 'TX-5497', label: 'Virement entrant', amount: 800, type: 'Crédit', date: '13/06', status: 'En attente'),
];

final initialCards = <BankCard>[
  BankCard(holder: 'Amira B.', number: '**** **** **** 4821', expiry: '09/28', type: 'Visa Débit', limit: 5000, status: 'Active'),
  BankCard(holder: 'Amira B.', number: '**** **** **** 9033', expiry: '03/27', type: 'Mastercard', limit: 8000, status: 'Active'),
  BankCard(holder: 'Amira B.', number: '**** **** **** 1156', expiry: '12/26', type: 'Visa Virtuelle', limit: 2000, status: 'Bloquée'),
];

const txStatuses = ['En attente', 'Validé', 'Rejeté', 'Annulé'];
const cardStatuses = ['Active', 'Bloquée', 'Expirée', 'En cours'];
