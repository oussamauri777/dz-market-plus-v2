import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'package:image_picker/image_picker.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/auth_provider.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});
  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _bioCtrl = TextEditingController();
  String _wilaya = '';
  bool _loading = false;
  String? _error;
  String? _imageUrl;
  bool _uploadingImage = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    if (user != null) {
      _nameCtrl.text = user.name;
      _phoneCtrl.text = user.phone ?? '';
      _wilaya = user.wilaya ?? '';
      _bioCtrl.text = user.bio ?? '';
      _imageUrl = user.image;
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
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
              Container(width: 40, height: 4, decoration: BoxDecoration(color: Theme.of(context).dividerColor, borderRadius: BorderRadius.circular(2))),
              const SizedBox(height: 16),
              ListTile(
                leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.photo_library, color: AppTheme.primaryColor)),
                title: Text(context.l10n.t('Ads.gallery'), style: const TextStyle(fontWeight: FontWeight.w600)),
                onTap: () => Navigator.pop(ctx, ImageSource.gallery),
              ),
              ListTile(
                leading: Container(padding: const EdgeInsets.all(8), decoration: BoxDecoration(color: AppTheme.primaryColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                  child: const Icon(Icons.camera_alt, color: AppTheme.primaryColor)),
                title: Text(context.l10n.t('Ads.camera'), style: const TextStyle(fontWeight: FontWeight.w600)),
                onTap: () => Navigator.pop(ctx, ImageSource.camera),
              ),
            ],
          ),
        ),
      ),
    );
    if (source == null) return;
    final picker = ImagePicker();
    final image = await picker.pickImage(source: source, imageQuality: 70);
    if (image == null) return;
    if (!mounted) return;
    setState(() => _uploadingImage = true);
    try {
      final url = Uri.parse('https://api.cloudinary.com/v1_1/duwk2v3ej/image/upload');
      final request = http.MultipartRequest('POST', url);
      request.fields['upload_preset'] = 'unsigned_upload';
      request.files.add(await http.MultipartFile.fromPath('file', image.path));
      final response = await request.send();
      if (response.statusCode == 200) {
        final responseData = await response.stream.toBytes();
        final responseString = String.fromCharCodes(responseData);
        final uploadedUrl = json.decode(responseString)['secure_url'] as String;
        setState(() => _imageUrl = uploadedUrl);
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('${context.l10n.t('Errors.uploadError')}: $e')));
    } finally {
      if (mounted) setState(() => _uploadingImage = false);
    }
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty) {
      setState(() => _error = context.l10n.t('Errors.required'));
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await context.read<AuthProvider>().updateProfile(
        name: _nameCtrl.text.trim(),
        phone: _phoneCtrl.text.trim().isEmpty ? null : _phoneCtrl.text.trim(),
        wilaya: _wilaya.isEmpty ? null : _wilaya,
        bio: _bioCtrl.text.trim().isEmpty ? null : _bioCtrl.text.trim(),
        image: _imageUrl,
      );
      if (mounted) Navigator.pop(context);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface), onPressed: () => Navigator.pop(context)),
        title: Text(context.l10n.t('Profile.editProfile'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          Center(child: GestureDetector(
            onTap: _uploadingImage ? null : _pickImage,
            child: Stack(children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Theme.of(context).dividerColor, width: 2)),
                child: ClipOval(
                  child: _imageUrl != null && _imageUrl!.isNotEmpty
                      ? Image.network(_imageUrl!, fit: BoxFit.cover, width: 100, height: 100,
                          errorBuilder: (_, __, ___) => _buildAvatarFallback(user?.name ?? '?'))
                      : _buildAvatarFallback(user?.name ?? '?'),
                ),
              ),
              if (_uploadingImage)
                Positioned.fill(child: Container(
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.black38),
                  child: const Center(child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))),
                ))
              else
                Positioned(bottom: 0, right: 0, child: Container(
                  width: 28, height: 28,
                  decoration: const BoxDecoration(shape: BoxShape.circle, color: AppTheme.primaryColor),
                  child: const Icon(Icons.add, size: 18, color: Colors.white),
                )),
            ]),
          )),
          const SizedBox(height: 32),
          AppTextField(controller: _nameCtrl, labelText: context.l10n.t('Auth.name'), prefixIcon: Icons.person_outline_rounded),
          const SizedBox(height: 16),
          AppTextField(controller: _phoneCtrl, labelText: context.l10n.t('Profile.phone'), prefixIcon: Icons.phone_outlined, keyboardType: TextInputType.phone),
          const SizedBox(height: 16),
          TextFormField(
            initialValue: _wilaya,
            decoration: InputDecoration(
              labelText: context.l10n.t('Auth.wilaya'),
              prefixIcon: Icon(Icons.location_on_outlined, size: 20, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
              filled: true, fillColor: Theme.of(context).cardColor,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2)),
            ),
            style: TextStyle(fontSize: 15, color: Theme.of(context).colorScheme.onSurface),
            onChanged: (v) => _wilaya = v,
          ),
          const SizedBox(height: 16),
          AppTextField(controller: _bioCtrl, labelText: context.l10n.t('Ads.description'), prefixIcon: Icons.description_outlined, maxLines: 3, maxLength: 500),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.redColor, fontSize: 13)),
          ],
          const SizedBox(height: 24),
          AppButton(label: context.l10n.t('Common.save'), onPressed: _save, isLoading: _loading),
        ]),
      ),
    );
  }

  Widget _buildAvatarFallback(String name) {
    return Container(
      color: AppTheme.primaryColor.withValues(alpha: 0.15),
      child: Center(
        child: Text(name.isNotEmpty ? name[0].toUpperCase() : '?',
          style: const TextStyle(fontSize: 36, fontWeight: FontWeight.w700, color: AppTheme.primaryColor)),
      ),
    );
  }
}
