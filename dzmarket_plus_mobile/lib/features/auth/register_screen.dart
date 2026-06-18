import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import 'package:provider/provider.dart';
import '../../core/providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _confirmCtrl = TextEditingController();
  final _codeCtrl = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  String? _error;
  int _step = 1;
  String _wilaya = '';

  static const _wilayas = ['Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna', 'Sétif',
    'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'Skikda', 'Béjaïa', 'Tlemcen', 'Ouargla', 'Médéa',
    'Mostaganem', 'M\'Sila', 'Mascara', 'Djelfa', 'Tiaret', 'Tizi Ouzou', 'Laghouat', 'Oum El Bouaghi',
    'Bouira', 'Tamanrasset', 'Béchar', 'Adrar', 'Chlef', 'Jijel', 'Saïda', 'Guelma', 'Khenchela',
    'El Oued', 'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma', 'Aïn Témouchent', 'Ghardaïa',
    'Relizane', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès', 'El Tarf', 'Tindouf', 'Tissemsilt'];

  @override
  void dispose() {
    _nameCtrl.dispose(); _emailCtrl.dispose();
    _passwordCtrl.dispose(); _confirmCtrl.dispose(); _codeCtrl.dispose();
    super.dispose();
  }

  bool get _has8 => _passwordCtrl.text.length >= 8;
  bool get _hasUpper => RegExp(r'[A-Z]').hasMatch(_passwordCtrl.text);
  bool get _hasLower => RegExp(r'[a-z]').hasMatch(_passwordCtrl.text);
  bool get _hasDigit => RegExp(r'[0-9]').hasMatch(_passwordCtrl.text);

  Future<void> _sendCode() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      await auth.sendVerificationCode(_emailCtrl.text.trim());
      if (mounted) setState(() => _step = 2);
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _register() async {
    setState(() { _loading = true; _error = null; });
    try {
      final auth = Provider.of<AuthProvider>(context, listen: false);
      await auth.verifyEmail(_emailCtrl.text.trim(), _codeCtrl.text.trim());
      await auth.register(_nameCtrl.text.trim(), _emailCtrl.text.trim(), _passwordCtrl.text, _wilaya);
      if (mounted) context.go('/');
    } catch (e) {
      if (mounted) setState(() => _error = e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
            const SizedBox(height: 20),
            Center(child: RichText(text: TextSpan(children: [
              TextSpan(text: 'DZ ', style: TextStyle(color: AppTheme.primaryColor, fontSize: 30, fontWeight: FontWeight.w800)),
              TextSpan(text: 'Market', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 30, fontWeight: FontWeight.w800)),
              TextSpan(text: '+', style: TextStyle(color: Color(0xFFEAB308), fontSize: 32, fontWeight: FontWeight.w900)),
            ]))),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Theme.of(context).dividerColor),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 24, offset: const Offset(0, 8))],
              ),
              child: _step == 1 ? _buildStep1() : _buildStep2(),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _buildStep1() {
    return Form(
      key: _formKey,
      child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
        Text(context.l10n.t('Auth.registerTitle'), textAlign: TextAlign.center,
          style: TextStyle(fontSize: 26, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
        const SizedBox(height: 4),
        Text(context.l10n.t('Auth.registerSubtitle'), textAlign: TextAlign.center,
          style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
        const SizedBox(height: 24),
        if (_error != null) ...[
          _ErrorBanner(_error!), const SizedBox(height: 16),
        ],
        TextFormField(
          controller: _nameCtrl,
          decoration: InputDecoration(labelText: context.l10n.t('Auth.name'), prefixIcon: const Icon(Icons.person_outline_rounded)),
          validator: (v) => (v == null || v.trim().isEmpty) ? context.l10n.t('Errors.required') : null,
        ),
        const SizedBox(height: 14),
        TextFormField(
          controller: _emailCtrl,
          keyboardType: TextInputType.emailAddress,
          decoration: InputDecoration(labelText: context.l10n.t('Auth.email'), prefixIcon: const Icon(Icons.mail_outline_rounded)),
          validator: (v) => (v == null || !v.contains('@')) ? context.l10n.t('Errors.invalidEmail') : null,
        ),
        const SizedBox(height: 14),
        DropdownButtonFormField<String>(
          value: _wilaya.isEmpty ? null : _wilaya,
          decoration: InputDecoration(labelText: context.l10n.t('Auth.wilaya'), prefixIcon: const Icon(Icons.location_on_outlined)),
          items: _wilayas.map((w) => DropdownMenuItem<String>(value: w, child: Text(w))).toList(),
          onChanged: (String? v) => setState(() => _wilaya = v ?? ''),
          validator: (v) => (v == null || v.isEmpty) ? context.l10n.t('Errors.selectWilaya') : null,
        ),
        const SizedBox(height: 14),
        TextFormField(
          controller: _passwordCtrl,
          obscureText: _obscure,
          onChanged: (_) => setState(() {}),
          decoration: InputDecoration(
            labelText: context.l10n.t('Auth.password'),
            prefixIcon: const Icon(Icons.lock_outline_rounded),
            suffixIcon: IconButton(
              icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined),
              onPressed: () => setState(() => _obscure = !_obscure),
            ),
          ),
          validator: (v) {
            if (v == null || v.length < 8) return context.l10n.t('Auth.passwordMin');
            if (!RegExp(r'[A-Z]').hasMatch(v)) return context.l10n.t('Auth.passwordUpper');
            if (!RegExp(r'[0-9]').hasMatch(v)) return context.l10n.t('Auth.passwordDigit');
            return null;
          },
        ),
        const SizedBox(height: 8),
        _PasswordHint(context.l10n.t('Auth.passwordMin'), _has8),
        _PasswordHint(context.l10n.t('Auth.passwordUpper'), _hasUpper),
        _PasswordHint(context.l10n.t('Auth.passwordLower'), _hasLower),
        _PasswordHint(context.l10n.t('Auth.passwordDigit'), _hasDigit),
        const SizedBox(height: 14),
        TextFormField(
          controller: _confirmCtrl,
          obscureText: _obscure,
          decoration: InputDecoration(labelText: context.l10n.t('Auth.confirmPassword'), prefixIcon: const Icon(Icons.lock_outline_rounded)),
          validator: (v) => v != _passwordCtrl.text ? context.l10n.t('Errors.passwordMismatch') : null,
        ),
        const SizedBox(height: 24),
        SizedBox(height: 52, child: ElevatedButton(
          onPressed: _loading ? null : _sendCode,
          child: _loading
              ? const SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text(context.l10n.t('Auth.next'), style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
        )),
        const SizedBox(height: 20),
        Row(mainAxisAlignment: MainAxisAlignment.center, children: [
          Text(context.l10n.t('Auth.alreadyAccount'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
          GestureDetector(
            onTap: () => context.go('/login'),
            child: Text(context.l10n.t('Auth.loginLink'), style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
          ),
        ]),
      ]),
    );
  }

  Widget _buildStep2() {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const SizedBox(height: 8),
      Container(
        width: 60, height: 60,
        decoration: const BoxDecoration(color: Color(0xFFD1FAE5), shape: BoxShape.circle),
        child: const Icon(Icons.mail_outline_rounded, color: Color(0xFF059669), size: 28),
      ),
      const SizedBox(height: 16),
      Text(context.l10n.t('Auth.emailVerification'), textAlign: TextAlign.center,
        style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w700)),
      const SizedBox(height: 8),
      Text('${context.l10n.t('Auth.codeSent')} ${_emailCtrl.text}', textAlign: TextAlign.center,
        style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 13)),
      const SizedBox(height: 24),
      if (_error != null) ...[_ErrorBanner(_error!), const SizedBox(height: 16)],
      TextFormField(
        controller: _codeCtrl,
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        maxLength: 6,
        style: const TextStyle(fontSize: 28, letterSpacing: 10, fontWeight: FontWeight.w700),
        decoration: const InputDecoration(
          hintText: '000000',
          counterText: '',
          contentPadding: EdgeInsets.symmetric(vertical: 20),
        ),
      ),
      const SizedBox(height: 24),
      Row(children: [
        Expanded(child: OutlinedButton(
          onPressed: () => setState(() => _step = 1),
          child: Text(context.l10n.t('Auth.back')),
        )),
        const SizedBox(width: 12),
        Expanded(child: ElevatedButton(
          onPressed: _loading ? null : _register,
          child: _loading
              ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
              : Text(context.l10n.t('Auth.verifyAndRegister'), style: const TextStyle(fontWeight: FontWeight.w700)),
        )),
      ]),
    ]);
  }
}

class _PasswordHint extends StatelessWidget {
  final String text;
  final bool met;
  const _PasswordHint(this.text, this.met);
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 2),
    child: Row(children: [
      Icon(met ? Icons.check_circle_rounded : Icons.radio_button_unchecked_rounded,
        size: 14, color: met ? const Color(0xFF16A34A) : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
      const SizedBox(width: 6),
      Text(text, style: TextStyle(fontSize: 12, color: met ? const Color(0xFF16A34A) : Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
    ]),
  );
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner(this.message);
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: const Color(0xFFFEF2F2),
      borderRadius: BorderRadius.circular(10),
      border: const Border(left: BorderSide(color: Color(0xFFEF4444), width: 4)),
    ),
    child: Text(message, style: const TextStyle(color: Color(0xFFDC2626), fontSize: 13)),
  );
}
