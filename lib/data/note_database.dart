import 'package:flutter/foundation.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi_web/sqflite_ffi_web.dart';
import 'package:notehub_app/data/note.dart';

class NoteDatabase {
  NoteDatabase._();
  static final NoteDatabase instance = NoteDatabase._();

  Database? _db;
  static bool _factoryReady = false;

  Future<void> _ensureFactory() async {
    if (_factoryReady) return;
    if (kIsWeb) {
      databaseFactory = databaseFactoryFfiWeb;
    }
    _factoryReady = true;
  }

  Future<Database> get database async {
    if (_db != null) return _db!;
    await _ensureFactory();
    _db = await _open();
    return _db!;
  }

  Future<Database> _open() async {
    String dbPath;
    if (kIsWeb) {
      dbPath = 'notehub.db';
    } else {
      final dir = await getApplicationDocumentsDirectory();
      dbPath = p.join(dir.path, 'notehub.db');
    }

    return openDatabase(
      dbPath,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
          )
        ''');
        final now = DateTime.now().toIso8601String();
        await db.insert('notes', {
          'title': 'Bienvenue sur NoteHub',
          'content': 'Ajoutez, modifiez et recherchez vos notes. Tout est stocké localement avec SQLite.',
          'created_at': now,
          'updated_at': now,
        });
        await db.insert('notes', {
          'title': 'Liste courses',
          'content': 'Lait, pain, œufs, café.',
          'created_at': now,
          'updated_at': now,
        });
      },
    );
  }

  Future<List<Note>> getNotes({String query = ''}) async {
    final db = await database;
    final q = query.trim();
    final rows = q.isEmpty
        ? await db.query('notes', orderBy: 'updated_at DESC')
        : await db.query(
            'notes',
            where: 'title LIKE ? OR content LIKE ?',
            whereArgs: ['%$q%', '%$q%'],
            orderBy: 'updated_at DESC',
          );
    return rows.map(Note.fromMap).toList();
  }

  Future<Note> insert(Note note) async {
    final db = await database;
    final id = await db.insert('notes', note.toMap()..remove('id'));
    return note.copyWith(id: id);
  }

  Future<int> update(Note note) async {
    final db = await database;
    return db.update(
      'notes',
      note.toMap(),
      where: 'id = ?',
      whereArgs: [note.id],
    );
  }

  Future<int> delete(int id) async {
    final db = await database;
    return db.delete('notes', where: 'id = ?', whereArgs: [id]);
  }
}
