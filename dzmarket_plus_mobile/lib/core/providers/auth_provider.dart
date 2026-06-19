import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:google_sign_in/google_sign_in.dart';
import '../config/app_config.dart';
import '../models/user.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  UserModel? _currentUser;
  String? _token;
  bool _isLoading = true;
  bool _googleSilentSignInAttempted = false;

  late final GoogleSignIn _googleSignIn;

  UserModel? get currentUser => _currentUser;
  String? get token => _token;
  bool get isAuthenticated => _token != null && _currentUser != null;
  bool get isLoading => _isLoading;
  bool get isEmailVerified => _currentUser?.badges.emailVerified ?? false;
  bool get isSeller => _currentUser?.role == 'seller';
  GoogleSignIn get googleSignIn => _googleSignIn;

  AuthProvider() {
    _googleSignIn = GoogleSignIn(
      clientId: kIsWeb ? AppConfig.googleClientId : null,
      serverClientId: kIsWeb ? null : AppConfig.googleClientId,
      scopes: ['email', 'profile'],
    );
    _loadSession();
  }

  Future<void> _loadSession() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _token = prefs.getString('auth_token');
      final userJson = prefs.getString('auth_user');

      if (_token != null && userJson != null) {
        _currentUser = UserModel.fromJson(json.decode(userJson));
      } else {
        _token = null;
        _currentUser = null;
      }
    } catch (e) {
      debugPrint('Error loading session: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> _saveSession(String token, UserModel user) async {
    _token = token;
    _currentUser = user;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
    await prefs.setString('auth_user', json.encode(user.toJson()));
    notifyListeners();
  }

  Future<void> login(String email, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/auth/mobile-login'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'email': email, 'password': password}),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200) {
        await _saveSession(data['token'], UserModel.fromJson(data['user']));
      } else {
        throw Exception(data['error'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  /// Try silent sign-in on web (restores previous Google session)
  Future<GoogleSignInAccount?> tryGoogleSilentSignIn() async {
    if (_googleSilentSignInAttempted) return null;
    _googleSilentSignInAttempted = true;
    try {
      return await _googleSignIn.signInSilently();
    } catch (_) {
      return null;
    }
  }

  /// Called when the GIS renderButton completes — exchanges the Google
  /// account for a backend JWT and creates/starts a local session.
  Future<void> completeGoogleSignIn(GoogleSignInAccount googleUser) async {
    try {
      final auth = await googleUser.authentication;

      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/auth/mobile-google'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': googleUser.email,
          'name': googleUser.displayName,
          'image': googleUser.photoUrl,
          'googleId': googleUser.id,
          'idToken': auth.idToken,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        await _saveSession(data['token'], UserModel.fromJson(data['user']));
      } else {
        throw Exception(data['error'] ?? 'Erreur de connexion Google');
      }
    } catch (e) {
      final msg = e.toString().replaceAll('Exception: ', '');
      if (msg == 'Connexion annulée') rethrow;
      throw Exception('Erreur Google Sign-In: $msg');
    }
  }

  Future<void> register(String name, String email, String password, String wilaya) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/register'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'name': name,
          'email': email,
          'password': password,
          'wilaya': wilaya,
        }),
      );

      final data = json.decode(response.body);

      if (response.statusCode == 200 || response.statusCode == 201) {
        await login(email, password);
      } else {
        throw Exception(data['error'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  // ─────────────── Email Verification ───────────────

  Future<void> sendVerificationCode(String email) async {
    await ApiService.sendVerificationCode(email);
  }

  Future<void> verifyEmail(String email, String code) async {
    await ApiService.verifyCode(email, code);
    if (_currentUser != null) {
      final updatedBadges = UserBadges(
        emailVerified: true,
        phoneVerified: _currentUser!.badges.phoneVerified,
        identityVerified: _currentUser!.badges.identityVerified,
      );
      _currentUser = UserModel(
        id: _currentUser!.id,
        name: _currentUser!.name,
        email: _currentUser!.email,
        role: _currentUser!.role,
        image: _currentUser!.image,
        phone: _currentUser!.phone,
        wilaya: _currentUser!.wilaya,
        bio: _currentUser!.bio,
        badges: updatedBadges,
        createdAt: _currentUser!.createdAt,
        updatedAt: _currentUser!.updatedAt,
      );
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('auth_user', json.encode(_currentUser!.toJson()));
      notifyListeners();
    }
  }

  // ─────────────── Profile Management ───────────────

  Future<void> updateProfile({
    required String name,
    String? phone,
    String? wilaya,
    String? bio,
    String? image,
  }) async {
    try {
      final result = await ApiService.updateProfile(
        name: name,
        phone: phone,
        wilaya: wilaya,
        bio: bio,
        image: image,
      );
      if (_currentUser != null) {
        _currentUser = UserModel(
          id: _currentUser!.id,
          name: name,
          email: _currentUser!.email,
          role: _currentUser!.role,
          image: result['image'] ?? _currentUser!.image,
          phone: phone ?? _currentUser!.phone,
          wilaya: wilaya ?? _currentUser!.wilaya,
          bio: bio ?? _currentUser!.bio,
          badges: _currentUser!.badges,
          createdAt: _currentUser!.createdAt,
          updatedAt: DateTime.now(),
        );
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('auth_user', json.encode(_currentUser!.toJson()));
        notifyListeners();
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  Future<void> changePassword(String currentPassword, String newPassword) async {
    await ApiService.changePassword(currentPassword, newPassword);
  }

  Future<void> forgotPassword(String email) async {
    await ApiService.forgotPassword(email);
  }

  // ─────────────── Session ───────────────

  Future<void> logout() async {
    _token = null;
    _currentUser = null;
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
    await prefs.remove('auth_user');
    notifyListeners();
  }
}
