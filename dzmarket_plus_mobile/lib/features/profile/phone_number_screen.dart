import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/auth_provider.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';

class PhoneNumberScreen extends StatefulWidget {
  const PhoneNumberScreen({super.key});
  @override
  State<PhoneNumberScreen> createState() => _PhoneNumberScreenState();
}

class _PhoneNumberScreenState extends State<PhoneNumberScreen> {
  final _phoneCtrl = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _success;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    if (user != null) _phoneCtrl.text = user.phone ?? '';
  }

  @override
  void dispose() {
    _phoneCtrl.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    final phone = _phoneCtrl.text.trim();
    if (phone.isEmpty) {
      setState(() => _error = context.l10n.t('Errors.required'));
      return;
    }
    setState(() { _loading = true; _error = null; _success = null; });
    try {
      await context.read<AuthProvider>().updateProfile(
        name: context.read<AuthProvider>().currentUser!.name,
        phone: phone,
      );
      setState(() => _success = context.l10n.t('Common.save'));
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface), onPressed: () => Navigator.pop(context)),
        title: Text(context.l10n.t('Profile.phone'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppTheme.primaryColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Row(children: [
              const Icon(Icons.info_outline, color: AppTheme.primaryColor, size: 20),
              const SizedBox(width: 12),
              Expanded(child: Text(context.l10n.t('PhoneNumber.hint'),
                style: TextStyle(color: AppTheme.primaryColor, fontSize: 13, height: 1.4))),
            ]),
          ),
          const SizedBox(height: 24),
          AppTextField(controller: _phoneCtrl, labelText: context.l10n.t('Profile.phone'), prefixIcon: Icons.phone_outlined, keyboardType: TextInputType.phone),
          if (_error != null) ...[
            const SizedBox(height: 12),
            Text(_error!, style: const TextStyle(color: AppTheme.redColor, fontSize: 13)),
          ],
          if (_success != null) ...[
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: AppTheme.greenColor.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
              child: Row(children: [
                const Icon(Icons.check_circle, color: AppTheme.greenColor, size: 20),
                const SizedBox(width: 8),
                Expanded(child: Text(_success!, style: const TextStyle(color: AppTheme.greenColor, fontSize: 13))),
              ]),
            ),
          ],
          const SizedBox(height: 24),
          AppButton(label: context.l10n.t('Common.save'), onPressed: _save, isLoading: _loading),
        ]),
      ),
    );
  }
}
