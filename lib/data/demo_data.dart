class SportMatch {
  SportMatch({
    required this.id,
    required this.sport,
    required this.teamA,
    required this.teamB,
    required this.venue,
    required this.date,
    required this.players,
    required this.maxPlayers,
    required this.status,
  });
  final String id;
  final String sport;
  final String teamA;
  final String teamB;
  final String venue;
  final String date;
  int players;
  final int maxPlayers;
  String status;
}

class SportTeam {
  SportTeam({
    required this.name,
    required this.sport,
    required this.captain,
    required this.members,
    required this.wins,
  });
  final String name;
  final String sport;
  final String captain;
  int members;
  int wins;
}

final initialMatches = <SportMatch>[
  SportMatch(id: 'MT-901', sport: 'Football', teamA: 'Tunis United', teamB: 'Lac FC', venue: 'Stade Omar', date: 'Sam. 15/06 18h', players: 18, maxPlayers: 22, status: 'Ouvert'),
  SportMatch(id: 'MT-900', sport: 'Football', teamA: 'Ariana Stars', teamB: 'Marsa XI', venue: 'Terrain Menzah', date: 'Dim. 16/06 10h', players: 22, maxPlayers: 22, status: 'Complet'),
  SportMatch(id: 'MT-899', sport: 'Basket', teamA: 'Hoops TN', teamB: 'Downtown Ballers', venue: 'Salle El Menzah', date: 'Ven. 14/06 20h', players: 8, maxPlayers: 10, status: 'Ouvert'),
  SportMatch(id: 'MT-898', sport: 'Basket', teamA: 'Court Kings', teamB: 'Slam Dunkers', venue: 'Gymnasium Sousse', date: 'Sam. 15/06 16h', players: 10, maxPlayers: 10, status: 'Joué'),
  SportMatch(id: 'MT-897', sport: 'Football', teamA: 'Sfax Friends', teamB: 'Coast FC', venue: 'Terrain Sfax', date: 'Dim. 16/06 17h', players: 14, maxPlayers: 22, status: 'Ouvert'),
];

final initialTeams = <SportTeam>[
  SportTeam(name: 'Tunis United', sport: 'Football', captain: 'Amine B.', members: 11, wins: 5),
  SportTeam(name: 'Hoops TN', sport: 'Basket', captain: 'Salma K.', members: 5, wins: 3),
  SportTeam(name: 'Lac FC', sport: 'Football', captain: 'Karim M.', members: 10, wins: 4),
  SportTeam(name: 'Downtown Ballers', sport: 'Basket', captain: 'Youssef T.', members: 5, wins: 2),
  SportTeam(name: 'Ariana Stars', sport: 'Football', captain: 'Ines R.', members: 9, wins: 6),
];

const matchStatuses = ['Ouvert', 'Complet', 'Joué', 'Annulé'];
