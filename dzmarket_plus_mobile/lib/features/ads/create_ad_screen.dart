import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:geolocator/geolocator.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../core/providers/ad_provider.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_dropdown.dart';
import '../../shared/widgets/app_button.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';

class CreateAdScreen extends StatefulWidget {
  const CreateAdScreen({super.key});

  @override
  State<CreateAdScreen> createState() => _CreateAdScreenState();
}

class _CreateAdScreenState extends State<CreateAdScreen> {
  final _formKey = GlobalKey<FormState>();
  final _titleCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _communeCtrl = TextEditingController();

  String _category = '';
  String _subcategory = '';
  String _wilaya = '';
  String _condition = 'good';
  bool _isNegotiable = false;
  bool _loading = false;
  String? _error;
  LatLng? _selectedLocation;
  final MapController _mapController = MapController();
  final List<String> _images = [];

  final Map<String, List<String>> _categoriesMap = {
    'Véhicules': ['Voitures', 'Motos', 'Camions', 'Pièces', 'Engins', 'Bateaux'],
    'Immobilier': ['Appartements', 'Maisons', 'Terrains', 'Location', 'Locaux commerciaux', 'Vacances'],
    'Informatique & Multimédia': ['Téléphones', 'Ordinateurs', 'Accessoires', 'Jeux vidéo', 'Appareils photo', 'TV & Son'],
    'Maison & Jardin': ['Meubles', 'Electroménager', 'Décoration', 'Bricolage', 'Jardinage', 'Vaisselle'],
    'Mode & Beauté': ['Vêtements Homme', 'Vêtements Femme', 'Chaussures', 'Montres & Bijoux', 'Parfums & Cosmétiques', 'Accessoires'],
    'Loisirs & Divertissement': ['Sport', 'Livres', 'Musique', 'Voyages', 'Instruments de musique', 'Art & Collection'],
    'Services & Emploi': ['Offres d\'emploi', 'Prestations de services', 'Cours & Formations', 'Réparations', 'Déménagement', 'Evénements'],
    'Animaux': ['Chiens', 'Chats', 'Oiseaux', 'Accessoires animaux', 'Autres animaux'],
    'Matériel Professionnel': ['Matériel industriel', 'Matériel médical', 'Bureautique', 'Outillage', 'Agriculture', 'Restauration'],
    'Autres': ['Divers'],
  };

  static const _wilayas = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif',
    'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'Skikda', 'Béjaïa', 'Tlemcen',
    'Ouargla', 'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Djelfa',
    'Tiaret', 'Tizi Ouzou', 'Laghouat', 'Oum El Bouaghi', 'Bouira',
    'Tamanrasset', 'Béchar', 'Adrar', 'Chlef', 'Jijel', 'Saïda', 'Guelma',
    'Khenchela', 'El Oued', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla',
    'Naâma', 'Aïn Témouchent', 'Ghardaïa', 'Relizane'
  ];

  static const _conditionValues = ['new', 'like-new', 'good', 'fair', 'refurbished', 'for-parts'];

  @override
  void dispose() {
    _titleCtrl.dispose();
    _priceCtrl.dispose();
    _descCtrl.dispose();
    _communeCtrl.dispose();
    _mapController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    if (_images.length >= 10) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(context.l10n.t('Errors.maxPhotos'))));
      return;
    }
    final picker = ImagePicker();
    final source = await showModalBottomSheet<ImageSource>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(AppTheme.radius2xl)),
      ),
      builder: (ctx) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(width: 40, height: 4,
                decoration: BoxDecoration(color: Theme.of(context).dividerColor, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              Text(context.l10n.t('Ads.addPhoto'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.photo_library, color: AppTheme.primaryColor),
                ),
                title: Text(context.l10n.t('Ads.gallery'), style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(context.l10n.t('Ads.photoHint')),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
              const Divider(indent: 72, endIndent: 16),
              ListTile(
                leading: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.camera_alt, color: AppTheme.primaryColor),
                ),
                title: Text(context.l10n.t('Ads.camera'), style: const TextStyle(fontWeight: FontWeight.w600)),
                subtitle: Text(context.l10n.t('Ads.photoHint')),
                trailing: const Icon(Icons.chevron_right),
                onTap: () => Navigator.pop(ctx, ImageSource.camera),
              ),
            ],
          ),
        ),
      ),
    );

    if (source == null) return;

    final image = await picker.pickImage(source: source, imageQuality: 70);
    if (image == null) return;

    if (!mounted) return;
    showDialog(context: context, barrierDismissible: false, builder: (ctx) => const Center(child: CircularProgressIndicator()));

    try {
      final imageUrl = await _uploadToCloudinary(image);
      if (imageUrl != null) setState(() => _images.add(imageUrl));
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${context.l10n.t('Errors.uploadError')}: $e')));
    } finally {
      if (mounted) Navigator.pop(context);
    }
  }

  Future<String?> _uploadToCloudinary(XFile file) async {
    try {
      final url = Uri.parse('https://api.cloudinary.com/v1_1/duwk2v3ej/image/upload');
      final request = http.MultipartRequest('POST', url);
      request.fields['upload_preset'] = 'unsigned_upload';
      request.files.add(await http.MultipartFile.fromPath('file', file.path));
      final response = await request.send();
      if (response.statusCode == 200) {
        final responseData = await response.stream.toBytes();
        final responseString = String.fromCharCodes(responseData);
        return json.decode(responseString)['secure_url'] as String;
      }
    } catch (e) {
      debugPrint("Cloudinary Upload error: $e");
    }
    return null;
  }

  Future<void> _getCurrentLocation() async {
    final status = await Permission.location.request();
    if (status.isGranted) {
      if (!mounted) return;
      showDialog(context: context, barrierDismissible: false, builder: (ctx) => const Center(child: CircularProgressIndicator()));
      try {
        final position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high, timeLimit: const Duration(seconds: 10));
        final point = LatLng(position.latitude, position.longitude);
        setState(() => _selectedLocation = point);
        _mapController.move(point, 14.0);
        final wilayaName = await _getWilayaFromCoords(position.latitude, position.longitude);
        if (wilayaName != null) {
          final matched = _matchWilaya(wilayaName);
          if (matched != null) setState(() => _wilaya = matched);
        }
      } catch (e) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${context.l10n.t('Common.error')}: $e')));
      } finally {
        if (mounted) Navigator.pop(context);
      }
    }
  }

  Future<String?> _getWilayaFromCoords(double lat, double lng) async {
    try {
      final url = Uri.parse('https://nominatim.openstreetmap.org/reverse?format=json&lat=$lat&lon=$lng&accept-language=fr');
      final response = await http.get(url, headers: {'User-Agent': 'dzmarket_plus_mobile'});
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        return data['address']?['state'] ?? data['address']?['province'] ?? data['address']?['county'];
      }
    } catch (e) {
      debugPrint("Geocoding error: $e");
    }
    return null;
  }

  String? _matchWilaya(String rawName) {
    final cleanRaw = rawName.toLowerCase().replaceAll('é', 'e').replaceAll('è', 'e').replaceAll('à', 'a').replaceAll('â', 'a').replaceAll('\'', ' ').replaceAll('-', ' ');
    for (final w in _wilayas) {
      final cleanW = w.toLowerCase().replaceAll('é', 'e').replaceAll('è', 'e').replaceAll('à', 'a').replaceAll('â', 'a').replaceAll('\'', ' ').replaceAll('-', ' ');
      if (cleanRaw.contains(cleanW) || cleanW.contains(cleanRaw)) return w;
    }
    return null;
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_category.isEmpty) { setState(() => _error = context.l10n.t('Errors.selectCategory')); return; }
    if (_subcategory.isEmpty) { setState(() => _error = context.l10n.t('Errors.selectSubcategory')); return; }
    setState(() { _loading = true; _error = null; });

    try {
      final double price = double.tryParse(_priceCtrl.text) ?? 0;
      await ApiService.createAd(
        title: _titleCtrl.text.trim(), description: _descCtrl.text.trim(), price: price,
        category: _category, subcategory: _subcategory, wilaya: _wilaya,
        commune: _communeCtrl.text.trim(), condition: _condition, images: _images,
        isNegotiable: _isNegotiable, latitude: _selectedLocation?.latitude, longitude: _selectedLocation?.longitude,
      );

      if (mounted) {
        await Provider.of<AdProvider>(context, listen: false).loadAds();
        showDialog(
          context: context, barrierDismissible: false,
          builder: (ctx) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radius2xl)),
            content: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.check_circle_rounded, color: AppTheme.primaryColor, size: 64),
                const SizedBox(height: 16),
                Text(context.l10n.t('Ads.publishSuccess'), style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Theme.of(context).colorScheme.onSurface)),
                const SizedBox(height: 8),
                Text(context.l10n.t('Ads.publishSuccessDesc'), textAlign: TextAlign.center, style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                const SizedBox(height: 24),
                AppButton(label: context.l10n.t('Common.close'), onPressed: () { Navigator.pop(ctx); context.go('/'); }),
              ],
            ),
          ),
        );
      }
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception:', '').trim());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  String _conditionLabel(String condition) {
    switch (condition) {
      case 'new': return context.l10n.t('Conditions.new');
      case 'like-new': return context.l10n.t('Conditions.likeNew');
      case 'good': return context.l10n.t('Conditions.excellent');
      case 'fair': return context.l10n.t('Conditions.good');
      case 'refurbished': return context.l10n.t('Conditions.refurbished');
      case 'for-parts': return context.l10n.t('Conditions.forParts');
      default: return condition;
    }
  }

  // ─────────────── Build ───────────────

  @override
  Widget build(BuildContext context) {
    final subcategories = _category.isEmpty ? <String>[] : _categoriesMap[_category]!;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: Text(context.l10n.t('Ads.createTitle'), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        centerTitle: true,
        backgroundColor: Theme.of(context).colorScheme.surface,
        foregroundColor: Theme.of(context).colorScheme.onSurface,
        elevation: 0,
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(1),
          child: Container(height: 1, color: Theme.of(context).dividerColor),
        ),
      ),
      body: Container(
        color: Theme.of(context).scaffoldBackgroundColor,
        child: Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
            children: [
              // White card wrapper
              Container(
                decoration: BoxDecoration(
                  color: Theme.of(context).cardColor,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 24, offset: const Offset(0, 8))],
                ),
                clipBehavior: Clip.antiAlias,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // ─── Header strip ───
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          colors: [AppTheme.primaryColor, Color(0xFF0D9488)],
                        ),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 48, height: 48,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.2),
                              borderRadius: BorderRadius.circular(14),
                            ),
                            child: const Icon(Icons.cloud_upload_rounded, color: Colors.white, size: 26),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(context.l10n.t('Ads.createTitle'),
                                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                                const SizedBox(height: 4),
                                Text(context.l10n.t('Ads.createSubtitle'),
                                  style: TextStyle(color: Colors.white.withValues(alpha: 0.85), fontSize: 12)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),

                    // ─── Padding for form content ───
                    Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (_error != null) ...[
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFFFEF2F2),
                                borderRadius: BorderRadius.circular(10),
                                border: const Border(left: BorderSide(color: Color(0xFFEF4444), width: 4)),
                              ),
                              child: Text(_error!, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13)),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // ─── Photos ───
                          Text(context.l10n.t('Ads.photos'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                          const SizedBox(height: 10),
                          GridView.builder(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                              crossAxisCount: 2, crossAxisSpacing: 12, mainAxisSpacing: 12, childAspectRatio: 1,
                            ),
                            itemCount: (_images.length >= 10) ? 10 : _images.length + 1,
                            itemBuilder: (ctx, i) {
                              if (i < _images.length) {
                                return Stack(
                                  children: [
                                    Container(
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(16),
                                        border: Border.all(color: Theme.of(context).dividerColor),
                                        image: DecorationImage(image: NetworkImage(_images[i]), fit: BoxFit.cover),
                                      ),
                                    ),
                                    if (i == 0)
                                      Positioned(
                                        top: 6, left: 6,
                                        child: Container(
                                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                          decoration: BoxDecoration(
                                            color: AppTheme.primaryColor,
                                            borderRadius: BorderRadius.circular(8),
                                          ),
                                          child: Text(context.l10n.t('Ads.mainPhoto'),
                                            style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                                        ),
                                      ),
                                    Positioned(
                                      top: 4, right: 4,
                                      child: GestureDetector(
                                        onTap: () => setState(() => _images.removeAt(i)),
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle),
                                          child: const Icon(Icons.close, color: Colors.white, size: 14),
                                        ),
                                      ),
                                    ),
                                  ],
                                );
                              }
                              return GestureDetector(
                                onTap: _pickImage,
                                child: Container(
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(color: Theme.of(context).dividerColor, width: 2),
                                  ),
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.camera_alt_outlined, color: AppTheme.primaryColor.withValues(alpha: 0.7), size: 32),
                                      const SizedBox(height: 8),
                                      Text(context.l10n.t('Ads.addPhoto'), style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: AppTheme.primaryColor.withValues(alpha: 0.7))),
                                    ],
                                  ),
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 8),
                          Text(context.l10n.t('Ads.photoHint'),
                            style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.44))),

                          // ─── Divider ───
                          Padding(
                            padding: const EdgeInsets.symmetric(vertical: 24),
                            child: Divider(height: 1, color: Theme.of(context).dividerColor),
                          ),

                          // ─── Title ───
                          AppTextField(
                            controller: _titleCtrl,
                            hintText: context.l10n.t('Ads.titleHint'),
                            labelText: context.l10n.t('Ads.title'),
                            prefixIcon: Icons.title_rounded,
                            validator: (v) => (v == null || v.trim().isEmpty) ? context.l10n.t('Errors.required') : null,
                          ),
                          const SizedBox(height: 20),

                          // ─── Category + Subcategory ───
                          AppDropdown(
                            value: _category.isEmpty ? null : _category,
                            hint: context.l10n.t('Ads.selectCategory'),
                            label: context.l10n.t('Ads.category'),
                            prefixIcon: Icons.tag_rounded,
                            items: _categoriesMap.keys.map((c) => DropdownMenuItem<String>(value: c, child: Text(c, style: const TextStyle(fontSize: 14)))).toList(),
                            onChanged: (v) => setState(() { _category = v ?? ''; _subcategory = ''; }),
                            validator: (v) => (v == null || v.isEmpty) ? context.l10n.t('Errors.selectCategory') : null,
                          ),
                          const SizedBox(height: 16),
                          AppDropdown(
                            value: _subcategory.isEmpty ? null : _subcategory,
                            hint: _category.isEmpty ? context.l10n.t('Ads.chooseCategoryFirst') : context.l10n.t('Ads.selectSubcategory'),
                            label: context.l10n.t('Ads.subcategory'),
                            prefixIcon: Icons.layers_outlined,
                            items: subcategories.map((s) => DropdownMenuItem<String>(value: s, child: Text(s, style: const TextStyle(fontSize: 14)))).toList(),
                            onChanged: _category.isEmpty ? null : (v) => setState(() => _subcategory = v ?? ''),
                            validator: (v) => (v == null || v.isEmpty) ? context.l10n.t('Errors.selectSubcategory') : null,
                          ),
                          const SizedBox(height: 20),

                          // ─── Wilaya + Commune + Condition ───
                          AppDropdown(
                            value: _wilaya.isEmpty ? null : _wilaya,
                            hint: context.l10n.t('Errors.selectWilaya'),
                            label: context.l10n.t('Ads.wilaya'),
                            prefixIcon: Icons.location_on_outlined,
                            items: _wilayas.map((w) => DropdownMenuItem<String>(value: w, child: Text(w, style: const TextStyle(fontSize: 14)))).toList(),
                            onChanged: (v) => setState(() => _wilaya = v ?? ''),
                            validator: (v) => (v == null || v.isEmpty) ? context.l10n.t('Errors.selectWilaya') : null,
                          ),
                          const SizedBox(height: 16),
                          AppTextField(
                            controller: _communeCtrl,
                            hintText: context.l10n.t('Ads.communeHint'),
                            labelText: context.l10n.t('Ads.commune'),
                            prefixIcon: Icons.location_on_outlined,
                          ),
                          const SizedBox(height: 16),
                          AppDropdown(
                            value: _condition,
                            label: context.l10n.t('Ads.condition'),
                            prefixIcon: Icons.info_outline_rounded,
                            items: _conditionValues.map((v) => DropdownMenuItem<String>(value: v, child: Text(_conditionLabel(v), style: const TextStyle(fontSize: 14)))).toList(),
                            onChanged: (v) => setState(() => _condition = v ?? 'good'),
                          ),
                          const SizedBox(height: 20),

                          // ─── Price ───
                          AppTextField(
                            controller: _priceCtrl,
                            hintText: '0',
                            labelText: context.l10n.t('Ads.price'),
                            prefixIcon: Icons.payments_outlined,
                            keyboardType: TextInputType.number,
                            validator: (v) => (v == null || double.tryParse(v) == null) ? context.l10n.t('Errors.invalidPrice') : null,
                          ),
                          const SizedBox(height: 24),

                          // ─── Description ───
                          Text(context.l10n.t('Ads.description'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                          const SizedBox(height: 10),
                          TextFormField(
                            controller: _descCtrl,
                            maxLines: 6,
                            decoration: InputDecoration(
                              hintText: context.l10n.t('Ads.descriptionHint'),
                              filled: true,
                              fillColor: Theme.of(context).cardColor,
                              contentPadding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
                              border: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: Theme.of(context).dividerColor),
                              ),
                              enabledBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: BorderSide(color: Theme.of(context).dividerColor),
                              ),
                              focusedBorder: OutlineInputBorder(
                                borderRadius: BorderRadius.circular(12),
                                borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                              ),
                              hintStyle: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 14),
                            ),
                            validator: (v) => (v == null || v.trim().length < 10) ? context.l10n.t('Errors.descriptionTooShort') : null,
                          ),
                          const SizedBox(height: 24),

                          // ─── Localisation ───
                          Container(
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: Theme.of(context).scaffoldBackgroundColor,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Theme.of(context).dividerColor),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                  children: [
                                    Text(context.l10n.t('Ads.location'), style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
                                    TextButton.icon(
                                      onPressed: _getCurrentLocation,
                                      icon: const Icon(Icons.my_location_rounded, size: 16),
                                      label: Text(context.l10n.t('Ads.myLocation'), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600)),
                                      style: TextButton.styleFrom(foregroundColor: AppTheme.primaryColor, padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 8),
                                Container(
                                  height: 220,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: Theme.of(context).dividerColor),
                                  ),
                                  child: ClipRRect(
                                    borderRadius: BorderRadius.circular(12),
                                    child: FlutterMap(
                                      mapController: _mapController,
                                      options: MapOptions(
                                        initialCenter: const LatLng(36.75, 3.05),
                                        initialZoom: 10.0,
                                        onTap: (tapPosition, point) => setState(() => _selectedLocation = point),
                                      ),
                                      children: [
                                        TileLayer(
                                          urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                          userAgentPackageName: 'com.oussamauri777.dzmarket_plus_mobile',
                                        ),
                                        if (_selectedLocation != null)
                                          MarkerLayer(
                                            markers: [
                                              Marker(
                                                point: _selectedLocation!,
                                                width: 40, height: 40,
                                                child: const Icon(Icons.location_pin, color: Colors.red, size: 40),
                                              ),
                                            ],
                                          ),
                                      ],
                                    ),
                                  ),
                                ),
                                if (_selectedLocation == null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Row(
                                      children: [
                                        Icon(Icons.info_outline_rounded, size: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.39)),
                                        const SizedBox(width: 6),
                                        Text(context.l10n.t('Ads.mapHint'),
                                          style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.39))),
                                      ],
                                    ),
                                  ),
                                if (_selectedLocation != null)
                                  Padding(
                                    padding: const EdgeInsets.only(top: 8),
                                    child: Row(
                                      children: [
                                                    Icon(Icons.location_on_rounded, size: 14, color: AppTheme.primaryColor.withValues(alpha: 0.7)),
                                        const SizedBox(width: 6),
                                        Text(context.l10n.t('Ads.selectPosition', params: [_selectedLocation!.latitude.toStringAsFixed(4), _selectedLocation!.longitude.toStringAsFixed(4)]),
                                          style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.39))),
                                      ],
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              // ─── Submit button ───
              SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.primaryColor,
                    foregroundColor: Colors.white,
                    elevation: 8,
                    shadowColor: AppTheme.primaryColor.withValues(alpha: 0.4),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  child: _loading
                      ? Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const SizedBox(width: 20, height: 20,
                              child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5)),
                            const SizedBox(width: 12),
                            Text(context.l10n.t('Ads.publishing')),
                          ],
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.cloud_upload_rounded, size: 22),
                            const SizedBox(width: 10),
                            Text(context.l10n.t('Ads.publish')),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
