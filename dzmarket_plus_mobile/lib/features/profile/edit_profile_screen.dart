import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
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

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    if (user != null) {
      _nameCtrl.text = user.name;
      _phoneCtrl.text = user.phone ?? '';
      _wilaya = user.wilaya ?? '';
      _bioCtrl.text = user.bio ?? '';
    }
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _phoneCtrl.dispose();
    _bioCtrl.dispose();
    super.dispose();
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
          Center(child: Stack(children: [
            Container(
              width: 100, height: 100,
              decoration: BoxDecoration(shape: BoxShape.circle, border: Border.all(color: Theme.of(context).dividerColor, width: 2)),
              child: ClipOval(
                child: user?.image != null && user!.image!.isNotEmpty
                    ? Image.network(user.image!, fit: BoxFit.cover, width: 100, height: 100,
                        errorBuilder: (_, __, ___) => _buildAvatarFallback(user.name))
                    : _buildAvatarFallback(user?.name ?? '?'),
              ),
            ),
          ])),
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
