import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/router/app_router.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final _pageCtrl = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageCtrl.dispose();
    super.dispose();
  }

  Future<void> _completeOnboarding() async {
    onboardingComplete = true;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('onboarding_complete', true);
    if (context.mounted) context.go('/');
  }

  @override
  Widget build(BuildContext context) {
    final t = context.l10n;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? AppTheme.darkBackgroundColor : AppTheme.backgroundColor;
    final textColor = isDark ? AppTheme.darkTextColor : AppTheme.textColor;
    final mutedColor = isDark ? AppTheme.darkTextMutedColor : AppTheme.textMutedColor;
    final dotInactive = isDark ? AppTheme.darkBorderColor : AppTheme.borderColor;

    final slides = [
      _SlideData(
        icon: Icons.storefront_rounded,
        color: AppTheme.primaryColor,
        title: t.t('Onboarding.welcomeTitle') ?? 'Bienvenue sur DZ Market+',
        desc: t.t('Onboarding.welcomeDesc') ?? 'Achetez et vendez en toute confiance en Algérie.',
      ),
      _SlideData(
        icon: Icons.search_rounded,
        color: AppTheme.yellowColor,
        title: t.t('Onboarding.searchTitle') ?? 'Trouvez ce que vous cherchez',
        desc: t.t('Onboarding.searchDesc') ?? 'Parcourez des milliers d\'annonces classées par catégories proches de chez vous.',
      ),
      _SlideData(
        icon: Icons.chat_bubble_outline_rounded,
        color: AppTheme.blueColor,
        title: t.t('Onboarding.chatTitle') ?? 'Discutez en temps réel',
        desc: t.t('Onboarding.chatDesc') ?? 'Messagerie intégrée pour échanger directement avec les vendeurs et acheteurs.',
      ),
      _SlideData(
        icon: Icons.favorite_rounded,
        color: AppTheme.accentColor,
        title: t.t('Onboarding.safeTitle') ?? 'Achetez et vendez en sécurité',
        desc: t.t('Onboarding.safeDesc') ?? 'Notre communauté de confiance vous permet de réaliser vos transactions sereinement.',
      ),
    ];

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  if (_currentPage < slides.length - 1)
                    TextButton(
                      onPressed: _completeOnboarding,
                      child: Text(
                        t.t('Onboarding.skip') ?? 'Passer',
                        style: TextStyle(color: mutedColor, fontSize: 15),
                      ),
                    )
                  else
                    const SizedBox(width: 1),
                ],
              ),
            ),
            // PageView
            Expanded(
              child: PageView.builder(
                controller: _pageCtrl,
                onPageChanged: (i) => setState(() => _currentPage = i),
                itemCount: slides.length,
                itemBuilder: (_, i) => _buildSlide(slides[i], textColor, mutedColor),
              ),
            ),
            // Dots
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 8),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(slides.length, (i) {
                  final isActive = i == _currentPage;
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: isActive ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: isActive ? slides[_currentPage].color : dotInactive,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  );
                }),
              ),
            ),
            const SizedBox(height: 8),
            // Next / Get Started button
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: () {
                    if (_currentPage < slides.length - 1) {
                      _pageCtrl.nextPage(
                        duration: const Duration(milliseconds: 400),
                        curve: Curves.easeInOut,
                      );
                    } else {
                      _completeOnboarding();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: slides[_currentPage].color,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppTheme.radiusMd),
                    ),
                    elevation: 0,
                  ),
                  child: Text(
                    _currentPage < slides.length - 1
                        ? (t.t('Common.next') ?? 'Suivant')
                        : (t.t('Onboarding.getStarted') ?? 'Commencer'),
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }

  Widget _buildSlide(_SlideData slide, Color textColor, Color mutedColor) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 40),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 140,
            height: 140,
            decoration: BoxDecoration(
              color: slide.color.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Icon(slide.icon, size: 64, color: slide.color),
          ),
          const SizedBox(height: 40),
          Text(
            slide.title,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            slide.desc,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              color: mutedColor,
              height: 1.4,
            ),
          ),
        ],
      ),
    );
  }
}

class _SlideData {
  final IconData icon;
  final Color color;
  final String title;
  final String desc;

  const _SlideData({
    required this.icon,
    required this.color,
    required this.title,
    required this.desc,
  });
}
