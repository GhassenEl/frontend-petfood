class LibraryItem {
  LibraryItem({
    required this.title,
    required this.author,
    required this.category,
    required this.year,
    required this.format,
    required this.copies,
    required this.emoji,
    this.borrowed = false,
  });
  final String title;
  final String author;
  final String category;
  final int year;
  final String format;
  int copies;
  final String emoji;
  bool borrowed;
}

class LibraryLoan {
  LibraryLoan({
    required this.id,
    required this.member,
    required this.title,
    required this.dueDate,
    required this.status,
  });
  final String id;
  final String member;
  final String title;
  final String dueDate;
  String status;
}

final initialBooks = <LibraryItem>[
  LibraryItem(title: 'L\'Étranger', author: 'Albert Camus', category: 'Livre', year: 1942, format: 'EPUB', copies: 5, emoji: '📕'),
  LibraryItem(title: 'Sapiens', author: 'Yuval Harari', category: 'Livre', year: 2011, format: 'PDF', copies: 3, emoji: '📘', borrowed: true),
  LibraryItem(title: 'Histoire de la Tunisie', author: 'Ibn Khaldoun', category: 'Livre', year: 1377, format: 'PDF', copies: 2, emoji: '📗'),
  LibraryItem(title: 'Clean Code', author: 'Robert Martin', category: 'Livre', year: 2008, format: 'EPUB', copies: 4, emoji: '💻'),
];

final initialJournals = <LibraryItem>[
  LibraryItem(title: 'Nature — Vol. 628', author: 'Nature Publishing', category: 'Journal', year: 2025, format: 'PDF', copies: 10, emoji: '🔬'),
  LibraryItem(title: 'Le Monde Diplomatique', author: 'LMD', category: 'Journal', year: 2025, format: 'PDF', copies: 8, emoji: '📰'),
  LibraryItem(title: 'Revue tunisienne de droit', author: 'UTM', category: 'Journal', year: 2024, format: 'PDF', copies: 6, emoji: '⚖️'),
  LibraryItem(title: 'IEEE Computer', author: 'IEEE', category: 'Journal', year: 2025, format: 'PDF', copies: 5, emoji: '🖥️'),
];

final initialSpiritual = <LibraryItem>[
  LibraryItem(title: 'Le Saint Coran', author: 'Trad. française', category: 'Coran', year: 0, format: 'PDF', copies: 20, emoji: '📿', borrowed: true),
  LibraryItem(title: 'Coran — Édition bilingue AR/FR', author: 'Dar El-Maarifa', category: 'Coran', year: 2020, format: 'EPUB', copies: 15, emoji: '🕌'),
  LibraryItem(title: 'Sahih Al-Bukhari (extraits)', author: 'Al-Bukhari', category: 'Hadith', year: 846, format: 'PDF', copies: 8, emoji: '📜'),
  LibraryItem(title: 'Tafsir Ibn Kathir — Juz 1', author: 'Ibn Kathir', category: 'Tafsir', year: 1370, format: 'PDF', copies: 6, emoji: '📖'),
  LibraryItem(title: 'Les Nourritures spirituelles', author: 'Maître Eckhart', category: 'Spiritualité', year: 1320, format: 'EPUB', copies: 3, emoji: '✨'),
];

final initialLoans = <LibraryLoan>[
  LibraryLoan(id: 'EMP-201', member: 'Amira B.', title: 'Sapiens', dueDate: '25/06', status: 'En cours'),
  LibraryLoan(id: 'EMP-200', member: 'Karim M.', title: 'Le Saint Coran', dueDate: '20/06', status: 'En cours'),
  LibraryLoan(id: 'EMP-199', member: 'Salma K.', title: 'Nature — Vol. 628', dueDate: '15/06', status: 'Retourné'),
];

const loanStatuses = ['En cours', 'Retourné', 'En retard', 'Réservé'];

List<LibraryItem> allCatalog(List<LibraryItem> books, List<LibraryItem> journals, List<LibraryItem> spiritual) {
  return [...books, ...journals, ...spiritual];
}
