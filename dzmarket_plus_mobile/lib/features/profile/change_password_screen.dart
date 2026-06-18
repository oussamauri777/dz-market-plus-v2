import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/auth_provider.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';

class ChangePasswordScreen extends StatefulWidget {
  const ChangePasswordScreen({super.key});
  @override
  State<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final _currentCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  bool _loading = false;
  bool _showCurrent = false;
  bool _showNew = false;
  bool _showConfirm = false;
  String? _error;
  String? _success;

  @override
  void dispose() {
    _currentCtrl.dispose();
    _newCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    final current = _currentCtrl.text;
    final newPw = _newCtrl.text;
    final confirm = _confirmCtrl.text;

    if (current.isEmpty || newPw.isEmpty || confirm.isEmpty) {
      setState(() => _error = context.l10n.t('Errors.required'));
      return;
    }
    if (newPw.length < 6) {
      setState(() => _error = context.l10n.t('Auth.passwordMin6'));
      return;
    }
    if (newPw != confirm) {
      setState(() => _error = context.l10n.t('Auth.passwordMismatch'));
      return;
    }

    setState(() { _loading = true; _error = null; _success = null; });
    try {
      await context.read<AuthProvider>().changePassword(current, newPw);
      setState(() => _success = context.l10n.t('Auth.passwordResetSuccess'));
      _currentCtrl.clear();
      _newCtrl.clear();
      _confirmCtrl.clear();
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
        title: Text(context.l10n.t('Profile.changePassword'), style: TextStyle(fontWeight: FontWeight.w700, color: Theme.of(context).colorScheme.onSurface)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
          const SizedBox(height: 16),
          _buildPasswordField(_currentCtrl, context.l10n.t('Auth.password'), _showCurrent, () => setState(() => _showCurrent = !_showCurrent)),
          const SizedBox(height: 16),
          _buildPasswordField(_newCtrl, context.l10n.t('Auth.newPassword'), _showNew, () => setState(() => _showNew = !_showNew)),
          const SizedBox(height: 16),
          _buildPasswordField(_confirmCtrl, context.l10n.t('Auth.confirmPassword'), _showConfirm, () => setState(() => _showConfirm = !_showConfirm)),
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
          AppButton(label: context.l10n.t('Common.save'), onPressed: _submit, isLoading: _loading),
        ]),
      ),
    );
  }

  Widget _buildPasswordField(TextEditingController ctrl, String label, bool obscure, VoidCallback toggle) {
    return TextFormField(
      controller: ctrl,
      obscureText: !obscure,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(Icons.lock_outline_rounded, size: 20, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
        suffixIcon: IconButton(icon: Icon(obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, size: 20), onPressed: toggle),
        filled: true, fillColor: Theme.of(context).cardColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: BorderSide(color: Theme.of(context).dividerColor)),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd), borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2)),
      ),
      style: TextStyle(fontSize: 15, color: Theme.of(context).colorScheme.onSurface),
    );
  }
}
