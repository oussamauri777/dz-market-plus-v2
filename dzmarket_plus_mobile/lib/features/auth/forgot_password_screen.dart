import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});
  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailCtrl = TextEditingController();
  bool _loading = false;
  bool _sent = false;
  String? _error;

  @override
  void dispose() {
    _emailCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) {
      setState(() => _error = context.l10n.t('Auth.emailRequired'));
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await ApiService.forgotPassword(email);
      setState(() => _sent = true);
    } catch (e) {
      setState(() => _error = e.toString());
    } finally {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Theme.of(context).colorScheme.surface,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back_rounded, color: Theme.of(context).colorScheme.onSurface), onPressed: () => Navigator.pop(context)),
        title: Text(context.l10n.t('Auth.forgotPassword'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: _sent ? _buildSuccess() : _buildForm(),
    );
  }

  Widget _buildForm() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const SizedBox(height: 40),
          const Icon(Icons.lock_outline_rounded, size: 64, color: AppTheme.primaryColor),
          const SizedBox(height: 24),
          Text(context.l10n.t('Auth.forgotPasswordTitle'),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
          const SizedBox(height: 12),
          Text(context.l10n.t('Auth.forgotPasswordDesc'),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), height: 1.5)),
          const SizedBox(height: 32),
          if (_error != null)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: AppTheme.redColor.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(AppTheme.radiusMd),
              ),
              child: Text(_error!, style: const TextStyle(color: AppTheme.redColor, fontSize: 13)),
            ),
          AppTextField(
            controller: _emailCtrl,
            hintText: context.l10n.t('Auth.emailAddress'),
            keyboardType: TextInputType.emailAddress,
          ),
          const SizedBox(height: 24),
          AppButton(
            label: context.l10n.t('Auth.sendLink'),
            onPressed: _submit,
            isLoading: _loading,
          ),
        ]),
      ),
    );
  }

  Widget _buildSuccess() {
    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
          Container(
            width: 80, height: 80,
            decoration: BoxDecoration(
              color: AppTheme.greenColor.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.check_rounded, size: 40, color: AppTheme.greenColor),
          ),
          const SizedBox(height: 24),
          Text(context.l10n.t('Auth.emailSent'),
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
          const SizedBox(height: 12),
          Text(context.l10n.t('Auth.resetLinkSent', params: [_emailCtrl.text.trim()]),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), height: 1.5)),
          const SizedBox(height: 32),
          AppButton(label: context.l10n.t('Auth.backToLogin'), onPressed: () => Navigator.pop(context)),
        ]),
      ),
    );
  }
}
