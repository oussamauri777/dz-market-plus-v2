import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:google_sign_in/google_sign_in.dart' show GoogleSignInAccount;
import '../../core/theme/app_theme.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/localization/app_localizations.dart';
import '../../shared/widgets/app_text_field.dart';
import '../../shared/widgets/app_button.dart';
import '../../shared/widgets/status_banner.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});
  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _loading = false;
  bool _googleLoading = false;
  bool _obscure = true;
  String? _error;

  Future<void> _loginWithGoogle() async {
    setState(() { _googleLoading = true; _error = null; });
    try {
      final auth = context.read<AuthProvider>();
      GoogleSignInAccount? googleUser;
      try {
        await auth.googleSignIn.signOut();
        googleUser = await auth.googleSignIn.signIn();
      } catch (_) {
        // Popup may be blocked on web — show user-friendly message
        if (kIsWeb && mounted) {
          setState(() {
            _googleLoading = false;
            _error = context.l10n.t('Auth.googlePopupBlocked');
          });
        }
        return;
      }
      if (googleUser == null) {
        if (mounted) setState(() => _googleLoading = false);
        return;
      }
      await auth.completeGoogleSignIn(googleUser);
      if (mounted) context.go('/');
    } catch (e) {
      final msg = e.toString().replaceAll('Exception: ', '');
      if (mounted && msg != 'Connexion annulée') setState(() => _error = msg);
    } finally {
      if (mounted) setState(() => _googleLoading = false);
    }
  }

  @override
  void dispose() {
    _emailCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() { _loading = true; _error = null; });
    try {
      await context.read<AuthProvider>().login(_emailCtrl.text.trim(), _passwordCtrl.text);
      if (mounted) context.go('/');
    } catch (e) {
      if (mounted) setState(() => _error = e.toString());
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
            Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(color: AppTheme.yellowColor, borderRadius: BorderRadius.circular(10)),
                    child: const Center(child: Text('D', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Color(0xFF1A1A1A)))),
                  ),
                  const SizedBox(width: 8),
                  const Text('DZ ', style: TextStyle(color: AppTheme.primaryColor, fontSize: 28, fontWeight: FontWeight.w800)),
                  Text('Market', style: TextStyle(color: Theme.of(context).colorScheme.onSurface, fontSize: 28, fontWeight: FontWeight.w800)),
                  const Text('+', style: TextStyle(color: AppTheme.yellowColor, fontSize: 30, fontWeight: FontWeight.w900)),
                ],
              ),
            ),
            const SizedBox(height: 32),
            Container(
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: Theme.of(context).cardColor,
                borderRadius: BorderRadius.circular(AppTheme.radius2xl),
                border: Border.all(color: Theme.of(context).dividerColor),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 24, offset: const Offset(0, 8))],
              ),
              child: Form(
                key: _formKey,
                child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                  Text(context.l10n.t('Auth.loginTitle'), textAlign: TextAlign.left,
                    style: TextStyle(fontSize: 24, fontWeight: FontWeight.w800, color: Theme.of(context).colorScheme.onSurface)),
                  const SizedBox(height: 4),
                  Text(context.l10n.t('HomePage.title'),
                    style: TextStyle(fontSize: 14, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                  const SizedBox(height: 24),
                  if (_error != null) ...[
                    StatusBanner(message: _error!, type: BannerType.error),
                    const SizedBox(height: 16),
                  ],
                  AppTextField(
                    controller: _emailCtrl,
                    hintText: context.l10n.t('Auth.email'),
                    labelText: context.l10n.t('Auth.email'),
                    prefixIcon: Icons.mail_outline_rounded,
                    keyboardType: TextInputType.emailAddress,
                    validator: (v) => (v == null || !v.contains('@')) ? context.l10n.t('Errors.invalidEmail') : null,
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: _passwordCtrl,
                    obscureText: _obscure,
                    decoration: InputDecoration(
                      labelText: context.l10n.t('Auth.password'),
                      prefixIcon: Icon(Icons.lock_outline_rounded, size: 20, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                      suffixIcon: IconButton(
                        icon: Icon(_obscure ? Icons.visibility_outlined : Icons.visibility_off_outlined, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                        onPressed: () => setState(() => _obscure = !_obscure),
                      ),
                      filled: true,
                      fillColor: AppTheme.surfaceColor,
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: BorderSide(color: Theme.of(context).dividerColor),
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: BorderSide(color: Theme.of(context).dividerColor),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                        borderSide: const BorderSide(color: AppTheme.primaryColor, width: 2),
                      ),
                      hintStyle: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 15),
                    ),
                    style: TextStyle(fontSize: 15, color: Theme.of(context).colorScheme.onSurface),
                    validator: (v) => (v == null || v.length < 6) ? context.l10n.t('Auth.passwordMin') : null,
                  ),
                  const SizedBox(height: 8),
                  Align(alignment: Alignment.centerRight, child: TextButton(
                    onPressed: () => context.push('/forgot-password'),
                    child: Text(context.l10n.t('Auth.forgotPassword'), style: const TextStyle(color: AppTheme.primaryColor, fontSize: 13)),
                  )),
                  const SizedBox(height: 8),
                  AppButton(
                    label: context.l10n.t('Navigation.login'),
                    onPressed: _loading ? null : _login,
                    isLoading: _loading,
                  ),
                  const SizedBox(height: 20),
                  Row(children: [
                    const Expanded(child: Divider()),
                    Padding(padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(context.l10n.t('Auth.orContinueWith'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 13))),
                    const Expanded(child: Divider()),
                  ]),
                  const SizedBox(height: 16),
                  _buildGoogleButton(),
                  const SizedBox(height: 20),
                  Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                    Text(context.l10n.t('Auth.noAccount'), style: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                    GestureDetector(
                      onTap: () => context.go('/register'),
                      child: Text(context.l10n.t('Navigation.register'),
                        style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w600)),
                    ),
                  ]),
                ]),
              ),
            ),
          ]),
        ),
      ),
    );
  }

  Widget _buildGoogleButton() {
    return SizedBox(
      height: 52,
      child: OutlinedButton.icon(
        onPressed: _googleLoading ? null : _loginWithGoogle,
        icon: _googleLoading
            ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2))
            : _GoogleIcon(),
        label: Text(
          _googleLoading ? context.l10n.t('Common.loading') : context.l10n.t('Auth.googleLogin'),
          style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface),
        ),
        style: OutlinedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 14),
          side: BorderSide(color: Theme.of(context).dividerColor),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(AppTheme.radiusMd)),
        ),
      ),
    );
  }
}

class _GoogleIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(width: 20, height: 20, child: CustomPaint(painter: _GooglePainter()));
  }
}

class _GooglePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final s = size.width / 24;
    canvas.save();
    canvas.scale(s, s);

    final paint = Paint()..style = PaintingStyle.fill;

    // Blue
    paint.color = const Color(0xFF4285F4);
    final p1 = Path()
      ..moveTo(22.56, 12.25)
      ..cubicTo(22.56, 11.47, 22.49, 10.72, 22.36, 10.0)
      ..lineTo(12.0, 10.0)
      ..lineTo(12.0, 14.26)
      ..lineTo(17.92, 14.26)
      ..cubicTo(17.66, 15.63, 16.88, 16.79, 15.71, 17.57)
      ..lineTo(15.71, 20.34)
      ..lineTo(19.28, 20.34)
      ..cubicTo(21.36, 18.42, 22.56, 15.6, 22.56, 12.25)
      ..close();
    canvas.drawPath(p1, paint);

    // Red
    paint.color = const Color(0xFFEA4335);
    final p2 = Path()
      ..moveTo(12.0, 5.38)
      ..cubicTo(13.62, 5.38, 15.06, 5.94, 16.21, 7.02)
      ..lineTo(19.36, 3.87)
      ..cubicTo(17.45, 2.09, 14.97, 1.0, 12.0, 1.0)
      ..cubicTo(7.7, 1.0, 3.99, 3.47, 2.18, 7.07)
      ..lineTo(5.84, 9.91)
      ..cubicTo(6.71, 7.31, 9.14, 5.38, 12.0, 5.38)
      ..close();
    canvas.drawPath(p2, paint);

    // Yellow
    paint.color = const Color(0xFFFBBC05);
    final p3 = Path()
      ..moveTo(5.84, 14.09)
      ..cubicTo(5.62, 13.43, 5.49, 12.73, 5.49, 12.0)
      ..cubicTo(5.49, 11.27, 5.62, 10.57, 5.84, 9.91)
      ..lineTo(5.84, 7.07)
      ..lineTo(2.18, 7.07)
      ..cubicTo(1.43, 8.55, 1.0, 10.22, 1.0, 12.0)
      ..cubicTo(1.0, 13.78, 1.43, 15.45, 2.18, 16.93)
      ..lineTo(5.03, 14.71)
      ..lineTo(5.84, 14.09)
      ..close();
    canvas.drawPath(p3, paint);

    // Green
    paint.color = const Color(0xFF34A853);
    final p4 = Path()
      ..moveTo(12.0, 23.0)
      ..cubicTo(14.97, 23.0, 17.46, 22.02, 19.28, 20.34)
      ..lineTo(15.71, 17.57)
      ..cubicTo(14.73, 18.23, 13.48, 18.63, 12.0, 18.63)
      ..cubicTo(9.14, 18.63, 6.71, 16.7, 5.84, 14.1)
      ..lineTo(2.18, 14.1)
      ..lineTo(2.18, 16.94)
      ..cubicTo(3.99, 20.53, 7.7, 23.0, 12.0, 23.0)
      ..close();
    canvas.drawPath(p4, paint);

    canvas.restore();
  }

  @override
  bool shouldRepaint(_) => false;
}
