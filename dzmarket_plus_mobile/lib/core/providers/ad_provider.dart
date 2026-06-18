import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/ad.dart';
import '../services/api_service.dart';

class AdProvider with ChangeNotifier {
  List<Ad> _recentAds = [];
  List<Ad> _searchResults = [];
  List<Ad> _favoritedAds = [];
  List<String> _favoriteIds = [];
  bool _isLoading = false;
  bool _isLoadingMore = false;
  bool _hasMore = true;
  int _currentPage = 1;
  String? _error;
  Map<String, dynamic>? _aiIntent;

  List<Ad> get recentAds => _recentAds;
  List<Ad> get searchResults => _searchResults;
  List<Ad> get favoritedAds => _favoritedAds;
  Map<String, dynamic>? get aiIntent => _aiIntent;
  List<String> get favoriteIds => _favoriteIds;
  bool get isLoading => _isLoading;
  bool get isLoadingMore => _isLoadingMore;
  bool get hasMore => _hasMore;
  String? get error => _error;

  AdProvider() {
    loadLocalFavorites();
  }

  Future<void> fetchRecentAds({bool refresh = false}) async {
    if (refresh) _currentPage = 1;
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _recentAds = await ApiService.getAds(limit: 20, page: _currentPage);
      _hasMore = _recentAds.length >= 20;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> loadMoreAds() async {
    if (_isLoadingMore || !_hasMore) return;
    _isLoadingMore = true;
    notifyListeners();

    try {
      _currentPage++;
      final more = await ApiService.getAds(limit: 20, page: _currentPage);
      _recentAds.addAll(more);
      _hasMore = more.length >= 20;
    } catch (e) {
      _currentPage--;
      _error = e.toString();
    } finally {
      _isLoadingMore = false;
      notifyListeners();
    }
  }

  Future<void> searchAds({String? query, String? category, String? subcategory, String? wilaya, String? commune, String? condition, int? minPrice, int? maxPrice, String? sort, int page = 1}) async {
    if (page == 1) _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.advancedSearch(
        query: query,
        category: category,
        subcategory: subcategory,
        wilaya: wilaya,
        commune: commune,
        condition: condition,
        minPrice: minPrice,
        maxPrice: maxPrice,
        sort: sort,
        page: page,
      );
      if (page == 1) {
        _searchResults = result.ads;
      } else {
        _searchResults.addAll(result.ads);
      }
      _hasMore = _searchResults.length < result.total;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> searchAdsAI(String query) async {
    _isLoading = true;
    _error = null;
    _aiIntent = null;
    notifyListeners();

    try {
      final result = await ApiService.searchAdsAI(query);
      _searchResults = result.ads;
      _aiIntent = result.intent;
      _hasMore = false;
    } catch (e) {
      _error = e.toString();
      _searchResults = [];
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  // ─────────────── Favorites (API + Local fallback) ───────────────

  Future<void> loadLocalFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final String? jsonStr = prefs.getString('favorited_ads');
      if (jsonStr != null) {
        final List<dynamic> list = json.decode(jsonStr);
        _favoritedAds = list.map((item) => Ad.fromJson(item)).toList();
        _favoriteIds = _favoritedAds.map((a) => a.id).toList();
      }
    } catch (e) {
      debugPrint('Error loading local favorites: $e');
    }
    notifyListeners();
  }

  Future<void> syncFavoritesFromApi() async {
    try {
      final ads = await ApiService.getFavorites();
      _favoritedAds = ads;
      _favoriteIds = ads.map((a) => a.id).toList();
      await _persistFavorites();
    } catch (e) {
      debugPrint('Favorites API sync failed, using local: $e');
    }
    notifyListeners();
  }

  Future<void> syncFavoriteIdsFromApi() async {
    try {
      final ids = await ApiService.getFavoriteIds();
      _favoriteIds = ids;
      // Remove any local favorites not in API response
      _favoritedAds.removeWhere((a) => !ids.contains(a.id));
      await _persistFavorites();
    } catch (e) {
      debugPrint('Favorite IDs sync failed: $e');
    }
    notifyListeners();
  }

  Future<void> toggleFavorite(Ad ad) async {
    final index = _favoritedAds.indexWhere((item) => item.id == ad.id);
    if (index >= 0) {
      _favoritedAds.removeAt(index);
      _favoriteIds.remove(ad.id);
    } else {
      _favoritedAds.add(ad);
      _favoriteIds.add(ad.id);
    }
    notifyListeners();

    try {
      // Try API sync
      await ApiService.toggleFavorite(ad.id);
    } catch (e) {
      debugPrint('Favorite API toggle failed, saving locally: $e');
    }
    await _persistFavorites();
  }

  Future<void> clearFavorites() async {
    _favoritedAds.clear();
    _favoriteIds.clear();
    notifyListeners();
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.remove('favorited_ads');
    } catch (e) {
      debugPrint('Error clearing favorites: $e');
    }
  }

  bool isFavorite(String adId) => _favoriteIds.contains(adId);

  Future<void> _persistFavorites() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonStr = json.encode(_favoritedAds.map((item) => item.toJson()).toList());
      await prefs.setString('favorited_ads', jsonStr);
    } catch (e) {
      debugPrint('Error saving favorites: $e');
    }
  }

  // ─────────────── My Ads (user-specific) ───────────────

  List<Ad> _myAds = [];
  int _myAdsPage = 1;
  bool _hasMoreMyAds = true;
  bool _isLoadingMyAds = false;
  bool _isLoadingMoreMyAds = false;

  List<Ad> get myAds => _myAds;
  bool get hasMoreMyAds => _hasMoreMyAds;
  bool get isLoadingMyAds => _isLoadingMyAds;
  bool get isLoadingMoreMyAds => _isLoadingMoreMyAds;

  Future<void> fetchMyAds(String userId) async {
    _myAdsPage = 1;
    _isLoadingMyAds = true;
    _error = null;
    notifyListeners();

    try {
      _myAds = await ApiService.getAdsBySeller(userId, page: 1);
      _hasMoreMyAds = _myAds.length >= 20;
    } catch (e) {
      _error = e.toString();
    } finally {
      _isLoadingMyAds = false;
      notifyListeners();
    }
  }

  Future<void> loadMoreMyAds(String userId) async {
    if (_isLoadingMoreMyAds || !_hasMoreMyAds) return;
    _isLoadingMoreMyAds = true;
    notifyListeners();

    try {
      _myAdsPage++;
      final more = await ApiService.getAdsBySeller(userId, page: _myAdsPage);
      _myAds.addAll(more);
      _hasMoreMyAds = more.length >= 20;
    } catch (e) {
      _myAdsPage--;
      _error = e.toString();
    } finally {
      _isLoadingMoreMyAds = false;
      notifyListeners();
    }
  }

  Future<void> loadAds() async {
    await fetchRecentAds();
  }
}
