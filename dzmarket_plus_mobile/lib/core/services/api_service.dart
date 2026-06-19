import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import '../config/app_config.dart';
import '../models/ad.dart';

class ApiService {
  static Future<String?> _getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  static Future<Map<String, String>> _authHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, String>> getAuthHeaders() async {
    final token = await _getToken();
    return {
      'Content-Type': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }

  static Future<Map<String, String>> _jsonHeaders() async {
    return {'Content-Type': 'application/json'};
  }

  // ─────────────── Ads ───────────────

  static Future<List<Ad>> getAds({
    String? category,
    String? wilaya,
    String? query,
    int page = 1,
    int limit = 10,
    String? sort,
  }) async {
    try {
      final params = <String, String>{
        'limit': limit.toString(),
        'page': page.toString(),
        if (category != null && category.isNotEmpty) 'category': category,
        if (wilaya != null && wilaya.isNotEmpty) 'wilaya': wilaya,
        if (query != null && query.isNotEmpty) 'query': query,
        if (sort != null && sort.isNotEmpty) 'sort': sort,
      };
      final uri = Uri.parse('${AppConfig.baseUrl}/ads').replace(queryParameters: params);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List<dynamic> data = decoded is List ? decoded : (decoded['ads'] ?? decoded['data'] ?? []);
        return data.map((json) => _mapJsonToAd(json)).toList();
      } else {
        throw Exception('Failed to load ads: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<({List<Ad> ads, int total})> advancedSearch({
    String? query,
    String? category,
    String? subcategory,
    String? wilaya,
    String? commune,
    String? condition,
    int? minPrice,
    int? maxPrice,
    String? sort,
    int page = 1,
    int limit = 50,
  }) async {
    try {
      final params = <String, String>{
        'limit': limit.toString(),
        'page': page.toString(),
        if (query != null && query.isNotEmpty) 'query': query,
        if (category != null && category.isNotEmpty) 'category': category,
        if (subcategory != null && subcategory.isNotEmpty) 'subcategory': subcategory,
        if (wilaya != null && wilaya.isNotEmpty) 'wilaya': wilaya,
        if (commune != null && commune.isNotEmpty) 'commune': commune,
        if (condition != null && condition.isNotEmpty) 'condition': condition,
        if (minPrice != null && minPrice > 0) 'minPrice': minPrice.toString(),
        if (maxPrice != null && maxPrice < 50000000) 'maxPrice': maxPrice.toString(),
        if (sort != null && sort.isNotEmpty) 'sort': sort,
      };
      final uri = Uri.parse('${AppConfig.baseUrl}/search').replace(queryParameters: params);

      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final ads = (data['ads'] as List?)?.map((j) => _mapJsonToAd(j as Map<String, dynamic>)).toList() ?? [];
        final total = data['pagination']?['total'] ?? 0;
        return (ads: ads, total: total as int);
      } else {
        throw Exception('Search failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<Ad> getAdById(String id) async {
    try {
      final response = await http.get(Uri.parse('${AppConfig.baseUrl}/ads/$id'));

      if (response.statusCode == 200) {
        return _mapJsonToAd(json.decode(response.body));
      } else {
        throw Exception('Failed to load ad details');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<Ad> createAd({
    required String title,
    required String description,
    required double price,
    required String category,
    required String subcategory,
    required String wilaya,
    required String commune,
    required String condition,
    required List<String> images,
    double? latitude,
    double? longitude,
    bool isNegotiable = false,
  }) async {
    try {
      final headers = await _authHeaders();

      final locationData = <String, dynamic>{
        'wilaya': wilaya,
        'commune': commune,
      };

      if (latitude != null && longitude != null) {
        locationData['latitude'] = latitude;
        locationData['longitude'] = longitude;
      }

      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/ads'),
        headers: headers,
        body: json.encode({
          'title': title,
          'description': description,
          'price': price,
          'category': category,
          'subcategory': subcategory,
          'wilaya': wilaya,
          'condition': condition,
          'images': images,
          'isNegotiable': isNegotiable,
          'location': locationData,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        return _mapJsonToAd(json.decode(response.body));
      } else {
        throw Exception(response.body);
      }
    } catch (e) {
      throw Exception('Failed to publish: $e');
    }
  }

  // ─────────────── Users ───────────────

  static Future<Map<String, dynamic>> getUserProfile(String userId) async {
    try {
      final response = await http.get(Uri.parse('${AppConfig.baseUrl}/users/$userId'));
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to load user profile: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<Map<String, dynamic>> updateProfile({
    required String name,
    String? phone,
    String? wilaya,
    String? bio,
    String? image,
  }) async {
    try {
      final headers = await _authHeaders();
      final response = await http.put(
        Uri.parse('${AppConfig.baseUrl}/users/profile'),
        headers: headers,
        body: json.encode({
          'name': name,
          if (phone != null) 'phone': phone,
          if (wilaya != null) 'wilaya': wilaya,
          if (bio != null) 'bio': bio,
          if (image != null) 'image': image,
        }),
      );
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final err = json.decode(response.body);
        throw Exception(err['error'] ?? 'Failed to update profile');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  static Future<void> changePassword(String currentPassword, String newPassword) async {
    try {
      final headers = await _authHeaders();
      final response = await http.put(
        Uri.parse('${AppConfig.baseUrl}/users/password'),
        headers: headers,
        body: json.encode({
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        }),
      );
      if (response.statusCode != 200) {
        final err = json.decode(response.body);
        throw Exception(err['error'] ?? 'Failed to change password');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  // ─────────────── Auth / Email Verification ───────────────

  static Future<void> sendVerificationCode(String email) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/auth/email/send'),
        headers: await _jsonHeaders(),
        body: json.encode({'email': email}),
      );
      if (response.statusCode != 200) {
        final err = json.decode(response.body);
        throw Exception(err['error'] ?? 'Failed to send code');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  static Future<Map<String, dynamic>> verifyCode(String email, String code) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/auth/email/verify'),
        headers: await _jsonHeaders(),
        body: json.encode({'email': email, 'code': code}),
      );
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        final err = json.decode(response.body);
        throw Exception(err['error'] ?? 'Invalid code');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  static Future<void> forgotPassword(String email) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/auth/forgot-password'),
        headers: await _jsonHeaders(),
        body: json.encode({'email': email}),
      );
      if (response.statusCode != 200) {
        final err = json.decode(response.body);
        throw Exception(err['error'] ?? 'Failed to send reset email');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  static Future<void> resetPassword(String token, String password) async {
    try {
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/auth/reset-password'),
        headers: await _jsonHeaders(),
        body: json.encode({'token': token, 'password': password}),
      );
      if (response.statusCode != 200) {
        final err = json.decode(response.body);
        throw Exception(err['error'] ?? 'Failed to reset password');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  // ─────────────── Favorites ───────────────

  static Future<List<Ad>> getFavorites() async {
    try {
      final headers = await _authHeaders();
      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/favorites'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((json) => _mapJsonToAd(json)).toList();
      } else {
        throw Exception('Failed to load favorites: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<Map<String, dynamic>> toggleFavorite(String adId) async {
    try {
      final headers = await _authHeaders();
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/favorites'),
        headers: headers,
        body: json.encode({'adId': adId}),
      );
      if (response.statusCode == 200) {
        return json.decode(response.body);
      } else {
        throw Exception('Failed to toggle favorite');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<List<String>> getFavoriteIds() async {
    try {
      final headers = await _authHeaders();
      final response = await http.get(
        Uri.parse('${AppConfig.baseUrl}/favorites/ids'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        return data.map((e) => e.toString()).toList();
      } else {
        return [];
      }
    } catch (e) {
      return [];
    }
  }

  // ─────────────── Reviews ───────────────

  static Future<List<Map<String, dynamic>>> getUserReviews(String sellerId) async {
    final result = await getReviewsWithPagination(sellerId);
    return List<Map<String, dynamic>>.from(result['reviews'] ?? []);
  }

  static Future<Map<String, dynamic>> getAdReviewsWithStats(String adId, {int page = 1, int limit = 20}) async {
    try {
      final response = await http.get(Uri.parse('${AppConfig.baseUrl}/reviews?adId=$adId&page=$page&limit=$limit'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'reviews': List<Map<String, dynamic>>.from(data['reviews'] ?? []),
          'total': data['pagination']?['total'] ?? 0,
          'stats': data['stats'],
        };
      } else {
        throw Exception('Failed to load ad reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<Map<String, dynamic>> getReviewsWithPagination(String sellerId, {int page = 1, int limit = 20}) async {
    try {
      final response = await http.get(Uri.parse('${AppConfig.baseUrl}/reviews?sellerId=$sellerId&page=$page&limit=$limit'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return {
          'reviews': List<Map<String, dynamic>>.from(data['reviews'] ?? []),
          'total': data['pagination']?['total'] ?? 0,
        };
      } else {
        throw Exception('Failed to load user reviews: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<List<Ad>> getAdsBySeller(String sellerId, {int page = 1, int limit = 20}) async {
    try {
      final response = await http.get(Uri.parse('${AppConfig.baseUrl}/ads?user=$sellerId&page=$page&limit=$limit'));
      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List<dynamic> data = decoded is List ? decoded : (decoded['ads'] ?? decoded['data'] ?? []);
        return data.map((json) => _mapJsonToAd(json)).toList();
      } else {
        throw Exception('Failed to load seller ads: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  static Future<Map<String, dynamic>> submitReview({
    required String targetUserId,
    required String adId,
    required int rating,
    required String comment,
  }) async {
    try {
      final headers = await _authHeaders();

      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/reviews'),
        headers: headers,
        body: json.encode({
          'targetUserId': targetUserId,
          'adId': adId,
          'rating': rating,
          'comment': comment,
        }),
      );
      if (response.statusCode == 200 || response.statusCode == 201) {
        return json.decode(response.body);
      } else {
        final err = json.decode(response.body);
        throw Exception(err['error'] ?? 'Failed to submit review');
      }
    } catch (e) {
      throw Exception(e.toString().replaceAll('Exception: ', ''));
    }
  }

  // ─────────────── Messages ───────────────

  static Future<void> deleteMessage(String messageId) async {
    try {
      final headers = await _authHeaders();
      await http.delete(
        Uri.parse('${AppConfig.baseUrl}/messages/$messageId'),
        headers: headers,
      );
    } catch (e) {
      throw Exception('Failed to delete message: $e');
    }
  }

  // ─────────────── AI Search ───────────────

  static Future<({List<Ad> ads, Map<String, dynamic>? intent})> searchAdsAI(String query) async {
    try {
      final headers = await _jsonHeaders();
      final response = await http.post(
        Uri.parse('${AppConfig.baseUrl}/search/ai'),
        headers: headers,
        body: json.encode({'query': query}),
      );

      if (response.statusCode == 200) {
        final decoded = json.decode(response.body);
        final List<dynamic> rawResults = decoded['results'] ?? [];
        final ads = rawResults.map((j) => _mapJsonToAd(j as Map<String, dynamic>)).toList();
        final intent = decoded['intent'] as Map<String, dynamic>?;
        return (ads: ads, intent: intent);
      } else {
        throw Exception('AI search failed: ${response.statusCode}');
      }
    } catch (e) {
      throw Exception('API Error: $e');
    }
  }

  // ─────────────── Helper ───────────────

  static Ad _mapJsonToAd(Map<String, dynamic> json) {
    final userObj = json['user'];
    final userId = userObj is Map ? userObj['_id'] : userObj?.toString() ?? json['userId'] ?? '';
    final userName = userObj is Map ? userObj['name'] : json['userName'] ?? 'Utilisateur';
    final userImage = userObj is Map ? userObj['image'] : json['userImage'];

    return Ad(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      category: json['category'] ?? '',
      subcategory: json['subcategory'],
      wilaya: json['wilaya'] ?? '',
      location: json['location'] != null ? Map<String, dynamic>.from(json['location']) : null,
      condition: json['condition'],
      images: (json['images'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .where((url) => url.isNotEmpty)
              .toList() ?? [],
      userId: userId,
      userName: userName ?? 'Utilisateur',
      userImage: userImage,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt']) : DateTime.now(),
      status: json['status'] ?? 'active',
      viewCount: json['views'] ?? json['viewCount'] ?? 0,
      isNegotiable: json['isNegotiable'] ?? false,
      commune: json['location'] is Map ? json['location']['commune'] : null,
      embedding: json['embedding'] != null ? List<double>.from(json['embedding']) : null,
    );
  }

  // ─────────────── Admin ───────────────

  static Future<Map<String, dynamic>> getAdminOverview() async {
    final headers = await _authHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/admin/analytics/overview'),
      headers: headers,
    );
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load admin overview');
  }

  static Future<Map<String, dynamic>> getAdminCharts({int days = 30}) async {
    final headers = await _authHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/admin/analytics/charts?days=$days'),
      headers: headers,
    );
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load admin charts');
  }

  static Future<Map<String, dynamic>> getAdminUsers({int page = 1, String search = ''}) async {
    final headers = await _authHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/admin/users?page=$page&search=$search'),
      headers: headers,
    );
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load admin users');
  }

  static Future<void> updateUserRole(String userId, String role) async {
    final headers = await _authHeaders();
    final response = await http.patch(
      Uri.parse('${AppConfig.baseUrl}/admin/users/$userId'),
      headers: headers,
      body: json.encode({'role': role}),
    );
    if (response.statusCode != 200) throw Exception('Failed to update user');
  }

  static Future<void> deleteUser(String userId) async {
    final headers = await _authHeaders();
    final response = await http.delete(
      Uri.parse('${AppConfig.baseUrl}/admin/users/$userId'),
      headers: headers,
    );
    if (response.statusCode != 200) throw Exception('Failed to delete user');
  }

  static Future<Map<String, dynamic>> getAdminAds({int page = 1, String search = '', String status = ''}) async {
    final headers = await _authHeaders();
    final params = 'page=$page${search.isNotEmpty ? '&search=$search' : ''}${status.isNotEmpty ? '&status=$status' : ''}';
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/admin/ads?$params'),
      headers: headers,
    );
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load admin ads');
  }

  static Future<void> updateAdStatus(String adId, String status) async {
    final headers = await _authHeaders();
    final response = await http.patch(
      Uri.parse('${AppConfig.baseUrl}/admin/ads/$adId'),
      headers: headers,
      body: json.encode({'status': status}),
    );
    if (response.statusCode != 200) throw Exception('Failed to update ad');
  }

  static Future<void> deleteAd(String adId) async {
    final headers = await _authHeaders();
    final response = await http.delete(
      Uri.parse('${AppConfig.baseUrl}/admin/ads/$adId'),
      headers: headers,
    );
    if (response.statusCode != 200) throw Exception('Failed to delete ad');
  }

  static Future<Map<String, dynamic>> getAdminReports({String status = ''}) async {
    final headers = await _authHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/admin/reports${status.isNotEmpty ? '?status=$status' : ''}'),
      headers: headers,
    );
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load admin reports');
  }

  static Future<void> updateReportStatus(String reportId, String status) async {
    final headers = await _authHeaders();
    final response = await http.patch(
      Uri.parse('${AppConfig.baseUrl}/admin/reports?id=$reportId'),
      headers: headers,
      body: json.encode({'status': status}),
    );
    if (response.statusCode != 200) throw Exception('Failed to update report');
  }

  static Future<Map<String, dynamic>> getAdminReviews({int page = 1, int limit = 10}) async {
    final headers = await _authHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/admin/reviews?page=$page&limit=$limit'),
      headers: headers,
    );
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load admin reviews');
  }

  static Future<void> deleteAdminReview(String reviewId) async {
    final headers = await _authHeaders();
    final response = await http.delete(
      Uri.parse('${AppConfig.baseUrl}/admin/reviews?id=$reviewId'),
      headers: headers,
    );
    if (response.statusCode != 200) throw Exception('Failed to delete review');
  }

  static Future<Map<String, dynamic>> getAdminMessages({int page = 1, int limit = 10}) async {
    final headers = await _authHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/admin/messages?page=$page&limit=$limit'),
      headers: headers,
    );
    if (response.statusCode == 200) return json.decode(response.body);
    throw Exception('Failed to load admin messages');
  }

  // ─────────────── Notification Preferences ───────────────

  static Future<Map<String, dynamic>> getNotificationPreferences() async {
    final headers = await _authHeaders();
    final response = await http.get(
      Uri.parse('${AppConfig.baseUrl}/users/notification-preferences'),
      headers: headers,
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to load notification preferences');
  }

  static Future<Map<String, dynamic>> updateNotificationPreferences({
    required bool pushMessages,
    required bool pushAds,
    required bool emailNotifications,
  }) async {
    final headers = await _authHeaders();
    final response = await http.put(
      Uri.parse('${AppConfig.baseUrl}/users/notification-preferences'),
      headers: headers,
      body: json.encode({
        'pushMessages': pushMessages,
        'pushAds': pushAds,
        'emailNotifications': emailNotifications,
      }),
    );
    if (response.statusCode == 200) {
      return json.decode(response.body);
    }
    throw Exception('Failed to update notification preferences');
  }
}
