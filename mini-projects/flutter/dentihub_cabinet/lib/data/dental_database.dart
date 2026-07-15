import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';
import 'package:sqflite/sqflite.dart';
import 'package:sqflite_common_ffi_web/sqflite_ffi_web.dart';
import 'package:dentihub_cabinet/data/models.dart';

class DentalDatabase {
  DentalDatabase._();
  static final DentalDatabase instance = DentalDatabase._();

  Database? _db;
  static bool _factoryReady = false;

  Future<void> _ensureFactory() async {
    if (_factoryReady) return;
    if (kIsWeb) databaseFactory = databaseFactoryFfiWeb;
    _factoryReady = true;
  }

  Future<Database> get database async {
    if (_db != null) return _db!;
    await _ensureFactory();
    _db = await _open();
    return _db!;
  }

  Future<Database> _open() async {
    final path = kIsWeb ? 'dentihub.db' : p.join((await getApplicationDocumentsDirectory()).path, 'dentihub.db');
    return openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute('''
          CREATE TABLE patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            email TEXT NOT NULL,
            birth_year INTEGER NOT NULL,
            notes TEXT NOT NULL,
            last_visit TEXT NOT NULL,
            allergies TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE consultations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            patient_name TEXT NOT NULL,
            date_time TEXT NOT NULL,
            type TEXT NOT NULL,
            reason TEXT NOT NULL,
            status TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER NOT NULL,
            patient_name TEXT NOT NULL,
            action TEXT NOT NULL,
            detail TEXT NOT NULL,
            date TEXT NOT NULL
          )
        ''');
        await db.execute('''
          CREATE TABLE notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            body TEXT NOT NULL,
            type TEXT NOT NULL,
            created_at TEXT NOT NULL,
            read INTEGER NOT NULL DEFAULT 0
          )
        ''');

        await db.insert('patients', {
          'name': 'Amira Trabelsi',
          'phone': '+216 22 111 222',
          'email': 'amira.t@email.tn',
          'birth_year': 1992,
          'notes': 'Sensibilité gencives, contrôle 6 mois',
          'last_visit': '2026-06-12',
          'allergies': 'Latex',
        });
        await db.insert('patients', {
          'name': 'Karim Ben Ali',
          'phone': '+216 98 333 444',
          'email': 'karim.b@email.tn',
          'birth_year': 1985,
          'notes': 'Couronne molaire 36 à surveiller',
          'last_visit': '2026-05-20',
          'allergies': 'Aucune',
        });
        await db.insert('patients', {
          'name': 'Ines Mejri',
          'phone': '+216 55 777 888',
          'email': 'ines.m@email.tn',
          'birth_year': 2001,
          'notes': 'Orthodontie en cours',
          'last_visit': '2026-07-01',
          'allergies': 'Pénicilline',
        });

        await db.insert('consultations', {
          'patient_id': 1,
          'patient_name': 'Amira Trabelsi',
          'date_time': '2026-07-09 10:00',
          'type': 'Téléconsultation',
          'reason': 'Douleur sensibilité froide',
          'status': 'Planifiée',
        });
        await db.insert('consultations', {
          'patient_id': 2,
          'patient_name': 'Karim Ben Ali',
          'date_time': '2026-07-09 14:30',
          'type': 'Cabinet',
          'reason': 'Contrôle couronne',
          'status': 'Planifiée',
        });
        await db.insert('consultations', {
          'patient_id': 3,
          'patient_name': 'Ines Mejri',
          'date_time': '2026-07-08 16:00',
          'type': 'Téléconsultation',
          'reason': 'Suivi appareil',
          'status': 'Terminée',
        });

        final now = DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now());
        await db.insert('history', {
          'patient_id': 3,
          'patient_name': 'Ines Mejri',
          'action': 'Téléconsultation',
          'detail': 'Suivi orthodontie — ajustement conseillé',
          'date': now,
        });
        await db.insert('history', {
          'patient_id': 1,
          'patient_name': 'Amira Trabelsi',
          'action': 'Détartrage',
          'detail': 'Séance hygiène + conseils brossage',
          'date': '2026-06-12',
        });

        await db.insert('notifications', {
          'title': 'Téléconsultation — Amira',
          'body': 'RDV demain 10h00 · douleur sensibilité',
          'type': 'Téléconsultation',
          'created_at': 'Il y a 15 min',
          'read': 0,
        });
        await db.insert('notifications', {
          'title': 'Allergie latex',
          'body': 'Rappel : Amira Trabelsi — utiliser gants nitrile',
          'type': 'Allergie',
          'created_at': 'Il y a 1 h',
          'read': 0,
        });
        await db.insert('notifications', {
          'title': 'Contrôle 6 mois',
          'body': 'Karim Ben Ali — couronne molaire à revoir',
          'type': 'Suivi',
          'created_at': 'Il y a 2 h',
          'read': 1,
        });
      },
    );
  }

  Future<List<DentalPatient>> getPatients({String query = ''}) async {
    final db = await database;
    final q = query.trim();
    final rows = q.isEmpty
        ? await db.query('patients', orderBy: 'name ASC')
        : await db.query(
            'patients',
            where: 'name LIKE ? OR phone LIKE ? OR notes LIKE ?',
            whereArgs: ['%$q%', '%$q%', '%$q%'],
            orderBy: 'name ASC',
          );
    return rows.map(DentalPatient.fromMap).toList();
  }

  Future<DentalPatient> insertPatient(DentalPatient patient) async {
    final db = await database;
    final id = await db.insert('patients', patient.toMap()..remove('id'));
    return patient.copyWith(id: id);
  }

  Future<int> updatePatient(DentalPatient patient) async {
    final db = await database;
    return db.update('patients', patient.toMap(), where: 'id = ?', whereArgs: [patient.id]);
  }

  Future<int> deletePatient(int id) async {
    final db = await database;
    return db.delete('patients', where: 'id = ?', whereArgs: [id]);
  }

  Future<List<DentalConsultation>> getConsultations() async {
    final db = await database;
    final rows = await db.query('consultations', orderBy: 'date_time DESC');
    return rows.map(DentalConsultation.fromMap).toList();
  }

  Future<DentalConsultation> insertConsultation(DentalConsultation c) async {
    final db = await database;
    final id = await db.insert('consultations', c.toMap()..remove('id'));
    await insertHistory(DentalHistory(
      patientId: c.patientId,
      patientName: c.patientName,
      action: c.type,
      detail: 'RDV planifié : ${c.reason}',
      date: DateFormat('yyyy-MM-dd HH:mm').format(DateTime.now()),
    ));
    await insertNotification(DentalNotification(
      title: '${c.type} — ${c.patientName}',
      body: '${c.dateTime} · ${c.reason}',
      type: c.type,
      createdAt: 'À l\'instant',
    ));
    return DentalConsultation(
      id: id,
      patientId: c.patientId,
      patientName: c.patientName,
      dateTime: c.dateTime,
      type: c.type,
      reason: c.reason,
      status: c.status,
    );
  }

  Future<int> updateConsultation(DentalConsultation c) async {
    final db = await database;
    return db.update('consultations', c.toMap(), where: 'id = ?', whereArgs: [c.id]);
  }

  Future<List<DentalHistory>> getHistory() async {
    final db = await database;
    final rows = await db.query('history', orderBy: 'date DESC');
    return rows.map(DentalHistory.fromMap).toList();
  }

  Future<void> insertHistory(DentalHistory h) async {
    final db = await database;
    await db.insert('history', h.toMap()..remove('id'));
  }

  Future<List<DentalNotification>> getNotifications() async {
    final db = await database;
    final rows = await db.query('notifications', orderBy: 'id DESC');
    return rows.map(DentalNotification.fromMap).toList();
  }

  Future<void> insertNotification(DentalNotification n) async {
    final db = await database;
    await db.insert('notifications', n.toMap()..remove('id'));
  }

  Future<void> markNotificationRead(int id) async {
    final db = await database;
    await db.update('notifications', {'read': 1}, where: 'id = ?', whereArgs: [id]);
  }

  Future<void> deleteNotification(int id) async {
    final db = await database;
    await db.delete('notifications', where: 'id = ?', whereArgs: [id]);
  }

  List<TreatmentRecommendation> buildRecommendations(List<DentalPatient> patients) {
    final recs = <TreatmentRecommendation>[];
    for (final p in patients) {
      if (p.notes.toLowerCase().contains('orthodont')) {
        recs.add(TreatmentRecommendation(
          patientName: p.name,
          title: 'Suivi orthodontie',
          detail: 'Contrôle mensuel appareil + hygiène interdentaire',
          priority: 'Moyenne',
        ));
      }
      if (p.notes.toLowerCase().contains('couronne') || p.notes.toLowerCase().contains('molaire')) {
        recs.add(TreatmentRecommendation(
          patientName: p.name,
          title: 'Contrôle couronne',
          detail: 'Radiographie bite-wing + test occlusion',
          priority: 'Haute',
        ));
      }
      if (p.notes.toLowerCase().contains('sensibilité') || p.notes.toLowerCase().contains('gencive')) {
        recs.add(TreatmentRecommendation(
          patientName: p.name,
          title: 'Traitement sensibilité',
          detail: 'Vernis fluoré + dentifrice désensibilisant',
          priority: 'Moyenne',
        ));
      }
      if (p.allergies.isNotEmpty && p.allergies.toLowerCase() != 'aucune') {
        recs.add(TreatmentRecommendation(
          patientName: p.name,
          title: 'Allergie : ${p.allergies}',
          detail: 'Adapter matériaux et antibioprophylaxie',
          priority: 'Critique',
        ));
      }
      final last = DateTime.tryParse(p.lastVisit);
      if (last != null && DateTime.now().difference(last).inDays > 150) {
        recs.add(TreatmentRecommendation(
          patientName: p.name,
          title: 'Rappel contrôle',
          detail: 'Dernier passage ${p.lastVisit} — prophylaxie recommandée',
          priority: 'Haute',
        ));
      }
    }
    if (recs.isEmpty && patients.isNotEmpty) {
      recs.add(TreatmentRecommendation(
        patientName: patients.first.name,
        title: 'Contrôle annuel',
        detail: 'Bilan dentaire de routine conseillé',
        priority: 'Basse',
      ));
    }
    return recs;
  }
}
