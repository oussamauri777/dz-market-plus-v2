import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/models/ad.dart';
import '../../core/providers/ad_provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/ad_card.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/app_badge.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/shimmer_grid.dart';
import '../../core/data/algeria_locations.dart';

const _subcategoriesByCategory = {
  'Véhicules': ['Voitures', 'Motos', 'Camions', 'Pièces', 'Engins', 'Bateaux'],
  'Immobilier': ['Appartements', 'Maisons', 'Terrains', 'Location', 'Locaux commerciaux', 'Vacances'],
  'Informatique & Multimédia': ['Téléphones', 'Ordinateurs', 'Accessoires', 'Jeux vidéo', 'Appareils photo', 'TV & Son'],
  'Maison & Jardin': ['Meubles', 'Electroménager', 'Décoration', 'Bricolage', 'Jardinage', 'Vaisselle'],
  'Mode & Beauté': ['Vêtements Homme', 'Vêtements Femme', 'Chaussures', 'Montres & Bijoux', 'Parfums & Cosmétiques', 'Accessoires'],
  'Loisirs & Divertissement': ['Sport', 'Livres', 'Musique', 'Voyages', 'Instruments de musique', 'Art & Collection'],
  'Services & Emploi': ["Offres d'emploi", 'Prestations de services', 'Cours & Formations', 'Réparations', 'Déménagement', 'Evénements'],
  'Animaux': ['Chiens', 'Chats', 'Oiseaux', 'Accessoires animaux', 'Autres animaux'],
  'Matériel Professionnel': ['Matériel industriel', 'Matériel médical', 'Bureautique', 'Outillage', 'Agriculture', 'Restauration'],
  'Autres': ['Divers'],
};

class SearchScreen extends StatefulWidget {
  final String query;
  final String category;
  final String subcategory;
  final String wilaya;
  final bool ai;
  const SearchScreen({super.key, this.query = '', this.category = '', this.subcategory = '', this.wilaya = '', this.ai = false});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  late final TextEditingController _searchCtrl;
  final _scrollCtrl = ScrollController();
  String _sortBy = 'newest';
  String _selectedWilaya = '';
  String _selectedCategory = '';
  String _selectedSubcategory = '';
  String _selectedCommune = '';
  String _selectedCondition = '';
  int? _minPrice;
  int? _maxPrice;
  bool _isAiSearch = false;
  int _searchPage = 1;
  bool _isLoadingMore = false;

  static const _sortOptions = [
    ('newest', 'Search.newest'),
    ('price_asc', 'Search.cheapest'),
    ('price_desc', 'Search.mostExpensive'),
  ];

  static const _conditions = [
    '', 'new', 'like-new', 'excellent', 'good', 'fair', 'refurbished', 'for-parts',
  ];

  @override
  void initState() {
    super.initState();
    _searchCtrl = TextEditingController(text: widget.query);
    _selectedWilaya = widget.wilaya;
    _selectedCategory = widget.category;
    _selectedSubcategory = widget.subcategory;
    if (widget.ai) _isAiSearch = true;
    WidgetsBinding.instance.addPostFrameCallback((_) => _performSearch());
    _scrollCtrl.addListener(_onScroll);
  }

  void _onScroll() {
    if (_isAiSearch) return;
    final provider = context.read<AdProvider>();
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 400
        && !_isLoadingMore && provider.hasMore) {
      setState(() => _isLoadingMore = true);
      _searchPage++;
      _doSearch(_searchPage).whenComplete(() { if (mounted) setState(() => _isLoadingMore = false); });
    }
  }

  void _performSearch() {
    _searchPage = 1;
    _isLoadingMore = false;
    _doSearch(1);
  }

  Future<void> _doSearch(int page) {
    final query = _searchCtrl.text.trim();
    if (_isAiSearch && query.isNotEmpty) {
      return context.read<AdProvider>().searchAdsAI(query);
    } else {
      return context.read<AdProvider>().searchAds(
        query: query,
        category: _selectedCategory,
        subcategory: _selectedSubcategory,
        wilaya: _selectedWilaya,
        commune: _selectedCommune,
        condition: _selectedCondition,
        minPrice: _minPrice,
        maxPrice: _maxPrice,
        sort: _sortBy,
        page: page,
      );
    }
  }

  void _openFilterDrawer() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _FilterDrawer(
        initialCategory: _selectedCategory,
        initialSubcategory: _selectedSubcategory,
        initialWilaya: _selectedWilaya,
        initialCommune: _selectedCommune,
        initialCondition: _selectedCondition,
        initialMinPrice: _minPrice,
        initialMaxPrice: _maxPrice,
        initialIsAiSearch: _isAiSearch,
        onApply: (category, subcategory, wilaya, commune, condition, minPrice, maxPrice) {
          setState(() {
            _selectedCategory = category;
            _selectedSubcategory = subcategory;
            _selectedWilaya = wilaya;
            _selectedCommune = commune;
            _selectedCondition = condition;
            _minPrice = minPrice;
            _maxPrice = maxPrice;
          });
          _performSearch();
        },
        onAiToggle: (v) => setState(() => _isAiSearch = v),
      ),
    );
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded),
          onPressed: () => context.go('/'),
        ),
        title: SizedBox(
          height: 40,
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: context.l10n.t(_isAiSearch ? 'Search.aiSearchPlaceholder' : 'HomePage.searchPlaceholder'),
              prefixIcon: const Icon(Icons.search_rounded, size: 20),
              filled: true,
              fillColor: Theme.of(context).scaffoldBackgroundColor,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(vertical: 0, horizontal: 12),
              hintStyle: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 14),
            ),
            style: const TextStyle(fontSize: 14),
            onSubmitted: (_) => _performSearch(),
          ),
        ),
        actions: [
          IconButton(
            icon: Icon(
              _isAiSearch ? Icons.auto_awesome_rounded : Icons.auto_awesome_outlined,
              color: _isAiSearch ? const Color(0xFF4338CA) : AppTheme.primaryColor,
            ),
            tooltip: context.l10n.t('Search.aiToggle'),
            onPressed: () {
              setState(() => _isAiSearch = !_isAiSearch);
              _performSearch();
            },
          ),
          IconButton(
            icon: const Icon(Icons.filter_list_rounded),
            onPressed: _openFilterDrawer,
            color: AppTheme.primaryColor,
          ),
        ],
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: Theme.of(context).dividerColor),
        ),
      ),
      body: Column(children: [
        // Sort bar
        Consumer<AdProvider>(builder: (context, provider, _) {
          final count = provider.searchResults.length;
          return Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(children: [
              Text('$count ${context.l10n.t('Search.results')}', style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
              const SizedBox(width: 8),
              if (_isAiSearch)
                AppBadge(label: context.l10n.t('Search.aiSearch'), variant: AppBadgeVariant.indigo, fontSize: 10),
              const Spacer(),
              DropdownButtonHideUnderline(child: DropdownButton<String>(
                value: _sortBy,
                isDense: true,
                style: TextStyle(fontSize: 13, color: Theme.of(context).colorScheme.onSurface),
                underline: const SizedBox(),
                items: _sortOptions.map((o) => DropdownMenuItem(
                  value: o.$1,
                  child: Text(context.l10n.t(o.$2), style: const TextStyle(fontSize: 13)),
                )).toList(),
                onChanged: (v) {
                  setState(() => _sortBy = v ?? 'newest');
                  _performSearch();
                },
              )),
            ]),
          );
        }),

        // Subcategory chips (shown when a category is selected)
        if (_selectedCategory.isNotEmpty && _subcategoriesByCategory.containsKey(_selectedCategory))
          Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 8),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(children: [
                ..._subcategoriesByCategory[_selectedCategory]!.map((s) => Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(s, style: TextStyle(fontSize: 12, color: _selectedSubcategory == s ? Colors.white : Theme.of(context).colorScheme.onSurface)),
                    selected: _selectedSubcategory == s,
                    selectedColor: AppTheme.primaryColor,
                    checkmarkColor: Colors.white,
                    backgroundColor: Theme.of(context).scaffoldBackgroundColor,
                    side: BorderSide(color: _selectedSubcategory == s ? AppTheme.primaryColor : Theme.of(context).dividerColor),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                    materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    visualDensity: VisualDensity.compact,
                    onSelected: (selected) {
                      setState(() {
                        _selectedSubcategory = selected ? s : '';
                      });
                      _performSearch();
                    },
                  ),
                )),
              ]),
            ),
          ),

        // Results
        Expanded(child: Consumer<AdProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return CustomScrollView(
                slivers: [ShimmerGrid(itemCount: 6)],
              );
            }
            if (provider.error != null) {
              return Center(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Icon(Icons.error_outline, size: 48, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                  const SizedBox(height: 12),
                  Text('${context.l10n.t('Common.error')}: ${provider.error}', style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                  const SizedBox(height: 16),
                  AppButton(label: context.l10n.t('Common.retry'), onPressed: _performSearch, variant: AppButtonVariant.outline, fullWidth: false),
                ]),
              );
            }

            final results = List<Ad>.from(provider.searchResults);

            if (results.isEmpty && _isAiSearch) {
              return SingleChildScrollView(
                controller: _scrollCtrl,
                padding: const EdgeInsets.all(16),
                child: Column(children: [
                  _AiIntentDisplay(intent: provider.aiIntent),
                  const SizedBox(height: 24),
                  EmptyState(
                    icon: Icons.search_off_rounded,
                    title: context.l10n.t('Common.noResults'),
                    subtitle: context.l10n.t('Common.noResultsDesc'),
                  ),
                ]),
              );
            }

            if (results.isEmpty) {
              return EmptyState(
                icon: Icons.search_off_rounded,
                title: context.l10n.t('Common.noResults'),
                subtitle: context.l10n.t('Common.noResultsDesc'),
              );
            }

            return RefreshIndicator(
              onRefresh: () async {
                _searchPage = 1;
                _performSearch();
              },
              child: CustomScrollView(
                controller: _scrollCtrl,
                slivers: [
                  if (_isAiSearch && provider.aiIntent != null)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
                        child: _AiIntentDisplay(intent: provider.aiIntent),
                      ),
                    ),
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverGrid(
                      delegate: SliverChildBuilderDelegate(
                        (ctx, i) => AdCard(ad: results[i]),
                        childCount: results.length,
                      ),
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 0.72,
                      ),
                    ),
                  ),
                  if (_isLoadingMore)
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.symmetric(vertical: 16),
                        child: Center(child: CircularProgressIndicator(strokeWidth: 2)),
                      ),
                    ),
                  const SliverToBoxAdapter(child: SizedBox(height: 32)),
                ],
              ),
            );
          },
        )),
      ]),
    );
  }
}

class _AiIntentDisplay extends StatelessWidget {
  final Map<String, dynamic>? intent;

  const _AiIntentDisplay({this.intent});

  @override
  Widget build(BuildContext context) {
    if (intent == null) return const SizedBox.shrink();
    final l = context.l10n;
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFFEEF2FF),
        border: Border.all(color: const Color(0xFFE0E7FF)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            const Icon(Icons.auto_awesome_rounded, size: 18, color: Color(0xFF4338CA)),
            const SizedBox(width: 8),
            Text(l.t('Search.aiAnalysis'), style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF312E81))),
          ]),
          const SizedBox(height: 8),
          Text(l.t('Search.aiUnderstood'), style: const TextStyle(color: Color(0xFF4338CA), fontSize: 13)),
          const SizedBox(height: 8),
          Wrap(spacing: 6, runSpacing: 6, children: [
            if (intent!['category'] != null)
              _IntentBadge(label: '${l.t('Search.aiCategory')}: ${intent!['category']}'),
            if (intent!['filters'] != null)
              for (final f in (intent!['filters'] as List)) _IntentBadge(label: f.toString()),
            if (intent!['minPrice'] != null)
              _IntentBadge(label: '${l.t('Search.aiMin')}: ${intent!['minPrice']} DA'),
            if (intent!['maxPrice'] != null)
              _IntentBadge(label: '${l.t('Search.aiMax')}: ${intent!['maxPrice']} DA'),
          ]),
        ],
      ),
    );
  }
}

class _IntentBadge extends StatelessWidget {
  final String label;
  const _IntentBadge({required this.label});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE0E7FF)),
      ),
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: Color(0xFF4338CA))),
    );
  }
}

class _FilterDrawer extends StatefulWidget {
  final String initialCategory;
  final String initialSubcategory;
  final String initialWilaya;
  final String initialCommune;
  final String initialCondition;
  final int? initialMinPrice;
  final int? initialMaxPrice;
  final bool initialIsAiSearch;
  final void Function(String category, String subcategory, String wilaya, String commune, String condition, int? minPrice, int? maxPrice) onApply;
  final void Function(bool value) onAiToggle;

  const _FilterDrawer({
    required this.initialCategory,
    required this.initialSubcategory,
    required this.initialWilaya,
    required this.initialCommune,
    required this.initialCondition,
    required this.initialMinPrice,
    required this.initialMaxPrice,
    required this.initialIsAiSearch,
    required this.onApply,
    required this.onAiToggle,
  });

  @override
  State<_FilterDrawer> createState() => _FilterDrawerState();
}

class _FilterDrawerState extends State<_FilterDrawer> {
  late String _category;
  late String _subcategory;
  late String _wilaya;
  late String _commune;
  late String _condition;
  late RangeValues _priceRange;
  late bool _isAiSearch;

  static const _categories = [
    '', 'Véhicules', 'Immobilier', 'Informatique & Multimédia',
    'Maison & Jardin', 'Mode & Beauté', 'Services & Emploi',
    'Animaux', 'Loisirs & Divertissement', 'Autres',
  ];

  static final _wilayas = ['', ...algerianWilayas.map((w) => w.name)];

  static const _conditions = [
    '', 'new', 'like-new', 'excellent', 'good', 'fair', 'refurbished', 'for-parts',
  ];

  @override
  void initState() {
    super.initState();
    _category = widget.initialCategory;
    _subcategory = widget.initialSubcategory;
    _wilaya = widget.initialWilaya;
    _commune = widget.initialCommune;
    _condition = widget.initialCondition;
    _priceRange = RangeValues(
      (widget.initialMinPrice ?? 0).toDouble(),
      (widget.initialMaxPrice ?? 50000000).toDouble(),
    );
    _isAiSearch = widget.initialIsAiSearch;
  }

  @override
  void dispose() {
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(AppTheme.radius2xl)),
      ),
      child: Column(
        children: [
          // Handle bar
          Padding(
            padding: const EdgeInsets.only(top: 12, bottom: 4),
            child: Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: Theme.of(context).dividerColor,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
          ),
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(context.l10n.t('Common.filter'), style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                TextButton(
                  onPressed: () => setState(() {
                    _category = '';
                    _subcategory = '';
                    _wilaya = '';
                    _commune = '';
                    _condition = '';
                    _priceRange = const RangeValues(0, 50000000);
                  }),
                  child: Text(context.l10n.t('Search.reset'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 14)),
                ),
              ],
            ),
          ),
          Divider(height: 1, color: Theme.of(context).dividerColor),
          // Scrollable content
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // AI Search toggle
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(children: [
                      Icon(Icons.auto_awesome_rounded, size: 18, color: _isAiSearch ? const Color(0xFF4338CA) : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                      const SizedBox(width: 8),
                      Text(context.l10n.t('Search.aiToggle'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                    ]),
                    SizedBox(
                      height: 28,
                      child: Switch.adaptive(
                        value: _isAiSearch,
                        activeColor: const Color(0xFF4338CA),
                        onChanged: (v) {
                          setState(() => _isAiSearch = v);
                          widget.onAiToggle(v);
                        },
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Category
                Text(context.l10n.t('Ads.category'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _category.isEmpty ? null : _category,
                  decoration: InputDecoration(
                    hintText: context.l10n.t('Search.allCategories'),
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      borderSide: BorderSide(color: Theme.of(context).dividerColor),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    hintStyle: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                  ),
                  style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface),
                  items: _categories.map((c) => DropdownMenuItem(
                    value: c.isEmpty ? null : c,
                    child: Text(c.isEmpty ? context.l10n.t('Search.allCategories') : c, style: const TextStyle(fontSize: 14)),
                  )).toList(),
                  onChanged: (v) => setState(() {
                    _category = v ?? '';
                    _subcategory = '';
                  }),
                ),
                // Subcategory (only visible when a category is selected)
                if (_category.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Sous-catégorie', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String?>(
                    value: _subcategory.isEmpty ? null : _subcategory,
                    decoration: InputDecoration(
                      hintText: 'Toutes les sous-catégories',
                      isDense: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: BorderSide(color: Theme.of(context).dividerColor),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      hintStyle: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                    ),
                    style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface),
                    items: [_subcategoriesByCategory[_category] ?? []].expand((list) => [
                      const DropdownMenuItem<String?>(value: null, child: Text('Toutes les sous-catégories', style: TextStyle(fontSize: 14))),
                      ...list.map((s) => DropdownMenuItem<String?>(
                        value: s,
                        child: Text(s, style: const TextStyle(fontSize: 14)),
                      )),
                    ]).toList(),
                    onChanged: (v) => setState(() => _subcategory = v ?? ''),
                  ),
                ],
                const SizedBox(height: 16),
                // Wilaya
                Text(context.l10n.t('Ads.wilaya'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _wilaya.isEmpty ? null : _wilaya,
                  decoration: InputDecoration(
                    hintText: context.l10n.t('Search.allWilayas'),
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      borderSide: BorderSide(color: Theme.of(context).dividerColor),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    hintStyle: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                  ),
                  style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface),
                  items: _wilayas.map((w) => DropdownMenuItem(
                    value: w.isEmpty ? null : w,
                    child: Text(w.isEmpty ? context.l10n.t('Search.allWilayas') : w, style: const TextStyle(fontSize: 14)),
                  )).toList(),
                  onChanged: (v) => setState(() => _wilaya = v ?? ''),
                ),
                // Commune (only visible when a wilaya is selected)
                if (_wilaya.isNotEmpty) ...[
                  const SizedBox(height: 16),
                  Text('Commune', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                  const SizedBox(height: 8),
                  DropdownButtonFormField<String>(
                    value: _commune.isEmpty ? null : _commune,
                    decoration: InputDecoration(
                      hintText: context.l10n.t('Search.allCommunes'),
                      isDense: true,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: BorderSide(color: Theme.of(context).dividerColor),
                      ),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                      hintStyle: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                    ),
                    style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface),
                    items: [
                      DropdownMenuItem(value: null, child: Text(context.l10n.t('Search.allCommunes'), style: const TextStyle(fontSize: 14))),
                      ...getCommunesByWilayaName(_wilaya).map((c) => DropdownMenuItem(
                        value: c.name,
                        child: Text(c.name, style: const TextStyle(fontSize: 14)),
                      )),
                    ],
                    onChanged: (v) => setState(() => _commune = v ?? ''),
                  ),
                ],
                const SizedBox(height: 16),
                // Condition
                Text(context.l10n.t('Ads.condition'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                const SizedBox(height: 8),
                DropdownButtonFormField<String>(
                  value: _condition.isEmpty ? null : _condition,
                  decoration: InputDecoration(
                    hintText: 'Tous les états',
                    isDense: true,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                      borderSide: BorderSide(color: Theme.of(context).dividerColor),
                    ),
                    contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    hintStyle: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                  ),
                  style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface),
                  items: _conditions.map((c) {
                    final label = c.isEmpty ? 'Tous les états' : context.l10n.t('Conditions.$c');
                    return DropdownMenuItem(
                      value: c.isEmpty ? null : c,
                      child: Text(label, style: const TextStyle(fontSize: 14)),
                    );
                  }).toList(),
                  onChanged: (v) => setState(() => _condition = v ?? ''),
                ),
                const SizedBox(height: 16),
                // Price range
                Text(context.l10n.t('Search.priceRange'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                const SizedBox(height: 8),
                RangeSlider(
                  values: _priceRange,
                  min: 0, max: 50000000,
                  divisions: 100,
                  activeColor: AppTheme.primaryColor,
                  inactiveColor: Theme.of(context).dividerColor,
                  labels: RangeLabels(
                    '${(_priceRange.start / 1000).round()}k',
                    '${(_priceRange.end / 1000).round()}k',
                  ),
                  onChanged: (v) => setState(() => _priceRange = v),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                    Text('${(_priceRange.start / 1000).round()} 000 DA', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                    Text('${(_priceRange.end / 1000).round()} 000 DA', style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                  ]),
                ),
              ],
            ),
          ),
          // Apply button
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 32),
            child: AppButton(
              label: context.l10n.t('Search.showResults'),
              onPressed: () {
                widget.onApply(
                  _category, _subcategory, _wilaya, _commune, _condition,
                  _priceRange.start.round(),
                  _priceRange.end.round(),
                );
                Navigator.of(context).pop();
              },
            ),
          ),
        ],
      ),
    );
  }
}
