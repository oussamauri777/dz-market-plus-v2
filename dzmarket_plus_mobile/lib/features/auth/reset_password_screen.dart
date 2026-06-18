import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';

class ResetPasswordScreen extends StatefulWidget {
  final String token;
  const ResetPasswordScreen({super.key, required this.token});
  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _done = false;
  String? _error;

  @override
  void dispose() {
    _passwordCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final password = _passwordCtrl.text;
    final confirm = _confirmCtrl.text;
    if (password.length < 6) {
      setState(() => _error = context.l10n.t('Auth.passwordMin6'));
      return;
    }
    if (password != confirm) {
      setState(() => _error = context.l10n.t('Auth.passwordMismatch'));
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      await ApiService.resetPassword(widget.token, password);
      setState(() => _done = true);
    } catch (e) {
      setState(() => _error = e.toString().replaceAll('Exception: ', ''));
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
        title: Text(context.l10n.t('Auth.password'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: _done ? _buildSuccess() : _buildForm(),
    );
  }

  Widget _buildForm() {
    return SafeArea(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const SizedBox(height: 40),
          const Icon(Icons.lock_reset_rounded, size: 64, color: AppTheme.primaryColor),
          const SizedBox(height: 24),
          Text(context.l10n.t('Auth.resetPasswordTitle'),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
          const SizedBox(height: 12),
          Text(context.l10n.t('Auth.resetPasswordHint'),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
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
          AppTextField(controller: _passwordCtrl, hintText: context.l10n.t('Auth.newPassword'), obscureText: true),
          const SizedBox(height: 16),
          AppTextField(controller: _confirmCtrl, hintText: context.l10n.t('Auth.confirmPassword'), obscureText: true),
          const SizedBox(height: 24),
          AppButton(label: context.l10n.t('Auth.reset'), onPressed: _submit, isLoading: _loading),
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
          Text(context.l10n.t('Auth.passwordResetSuccess'),
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
          const SizedBox(height: 12),
          Text(context.l10n.t('Auth.passwordResetDesc'),
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
          const SizedBox(height: 32),
          AppButton(label: context.l10n.t('Navigation.login'), onPressed: () => Navigator.pop(context)),
        ]),
      ),
    );
  }
}
