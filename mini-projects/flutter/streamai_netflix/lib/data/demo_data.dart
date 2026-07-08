class StreamTitle {
  StreamTitle({
    required this.name,
    required this.type,
    required this.genre,
    required this.year,
    required this.rating,
    required this.duration,
    required this.emoji,
    this.inWatchlist = false,
    this.userScore = 0,
  });
  final String name;
  final String type;
  final String genre;
  final int year;
  final double rating;
  final String duration;
  final String emoji;
  bool inWatchlist;
  int userScore;
}

class AiMessage {
  AiMessage({required this.role, required this.text});
  final String role;
  final String text;
}

final initialCatalog = <StreamTitle>[
  StreamTitle(name: 'Shadow Protocol', type: 'Série', genre: 'Thriller', year: 2025, rating: 4.8, duration: '8 ép.', emoji: '🕵️', inWatchlist: true, userScore: 5),
  StreamTitle(name: 'Neon Dreams', type: 'Film', genre: 'Sci-Fi', year: 2024, rating: 4.6, duration: '2h 10', emoji: '🌃', inWatchlist: true, userScore: 4),
  StreamTitle(name: 'Comedy Night', type: 'Film', genre: 'Comédie', year: 2023, rating: 4.2, duration: '1h 45', emoji: '😂'),
  StreamTitle(name: 'Ocean Deep', type: 'Documentaire', genre: 'Nature', year: 2025, rating: 4.9, duration: '1h 30', emoji: '🌊', inWatchlist: true),
  StreamTitle(name: 'Love in Paris', type: 'Film', genre: 'Romance', year: 2024, rating: 4.0, duration: '1h 55', emoji: '💕'),
  StreamTitle(name: 'Cyber Wars', type: 'Série', genre: 'Action', year: 2025, rating: 4.7, duration: '10 ép.', emoji: '⚔️', userScore: 5),
  StreamTitle(name: 'Kids Adventure', type: 'Film', genre: 'Famille', year: 2023, rating: 4.3, duration: '1h 20', emoji: '🎈'),
  StreamTitle(name: 'Dark Horizon', type: 'Film', genre: 'Horreur', year: 2024, rating: 4.1, duration: '1h 50', emoji: '👻'),
];

const moodKeywords = {
  'action': ['Action', 'Thriller'],
  'thriller': ['Thriller', 'Action'],
  'comédie': ['Comédie', 'Famille'],
  'comedie': ['Comédie', 'Famille'],
  'romance': ['Romance', 'Comédie'],
  'sci-fi': ['Sci-Fi', 'Action'],
  'science': ['Sci-Fi'],
  'famille': ['Famille', 'Comédie'],
  'horreur': ['Horreur', 'Thriller'],
  'documentaire': ['Nature'],
  'nature': ['Nature'],
  'détente': ['Comédie', 'Romance', 'Famille'],
  'detente': ['Comédie', 'Romance', 'Famille'],
  'soirée': ['Thriller', 'Action', 'Sci-Fi'],
  'soiree': ['Thriller', 'Action', 'Sci-Fi'],
};

String aiSynopsis(StreamTitle t) {
  final moods = {
    'Thriller': 'Un suspense haletant où chaque révélation change la donne.',
    'Sci-Fi': 'Un voyage futuriste mêlant technologie et émotions humaines.',
    'Comédie': 'Une comédie feel-good parfaite pour décompresser.',
    'Nature': 'Une immersion visuelle saisissante dans la beauté du monde.',
    'Romance': 'Une histoire d\'amour touchante et lumineuse.',
    'Action': 'Des scènes intenses et un rythme effréné du début à la fin.',
    'Famille': 'Un divertissement pour tous les âges, plein de cœur.',
    'Horreur': 'Une atmosphère oppressante qui vous tiendra en haleine.',
  };
  return '${t.emoji} **${t.name}** (${t.year}) — ${moods[t.genre] ?? 'Un titre incontournable de notre catalogue.'} Note IMDb simulée : ${t.rating}/5 · ${t.duration}.';
}

List<StreamTitle> aiRecommend(List<StreamTitle> catalog, String query, {List<StreamTitle>? watchlist}) {
  final q = query.toLowerCase();
  final genres = <String>{};
  for (final entry in moodKeywords.entries) {
    if (q.contains(entry.key)) genres.addAll(entry.value);
  }
  if (watchlist != null && watchlist.isNotEmpty) {
    for (final w in watchlist) {
      genres.add(w.genre);
    }
  }
  var results = catalog.where((t) => genres.contains(t.genre)).toList();
  if (results.isEmpty) {
    results = List.of(catalog)..sort((a, b) => b.rating.compareTo(a.rating));
  } else {
    results.sort((a, b) => b.rating.compareTo(a.rating));
  }
  return results.take(4).toList();
}

String aiChatReply(String input, List<StreamTitle> catalog, List<StreamTitle> watchlist) {
  final q = input.toLowerCase().trim();
  if (q.isEmpty) return 'Décrivez votre humeur, un genre ou un titre que vous avez aimé.';
  if (q.contains('bonjour') || q.contains('salut') || q.contains('hello')) {
    return 'Bonjour ! Je suis StreamAI. Dites-moi si vous voulez une comédie, un thriller, ou une soirée détente — je vous propose des titres adaptés.';
  }
  if (q.contains('watchlist') || q.contains('ma liste') || q.contains('analyse')) {
    if (watchlist.isEmpty) return 'Votre liste est vide. Ajoutez des titres depuis le catalogue (icône +) pour que je personnalise mes recommandations.';
    final genres = watchlist.map((t) => t.genre).toSet().join(', ');
    final picks = aiRecommend(catalog, q, watchlist: watchlist);
    final names = picks.map((t) => '• ${t.emoji} ${t.name}').join('\n');
    return 'D\'après votre liste ($genres), je vous recommande :\n$names';
  }
  if (q.contains('tendance') || q.contains('top') || q.contains('populaire')) {
    final top = List.of(catalog)..sort((a, b) => b.rating.compareTo(a.rating));
    return 'Top tendances :\n${top.take(3).map((t) => '• ${t.emoji} ${t.name} (${t.rating})').join('\n')}';
  }
  final picks = aiRecommend(catalog, q, watchlist: watchlist);
  if (picks.isEmpty) return 'Je n\'ai pas trouvé de correspondance. Essayez : action, comédie, romance, sci-fi.';
  final intro = q.contains('film') ? 'Films pour vous :' : q.contains('série') || q.contains('serie') ? 'Séries pour vous :' : 'Ma sélection IA :';
  return '$intro\n${picks.map((t) => '• ${t.emoji} ${t.name} — ${t.genre} · ${t.rating}/5').join('\n')}';
}
