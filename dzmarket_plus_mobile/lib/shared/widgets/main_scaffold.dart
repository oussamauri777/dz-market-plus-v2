import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/providers/chat_provider.dart';
import '../../core/providers/auth_provider.dart';
import '../../core/providers/notification_provider.dart';

class MainScaffold extends StatefulWidget {
  final Widget child;
  const MainScaffold({super.key, required this.child});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;
  bool _chatInitialized = false;
  bool _navVisible = true;

  static const _tabs = ['/', '/search', '/messages', '/profile'];

  List<_NavDef> _baseItems(BuildContext context) => [
    _NavDef(Icons.home_rounded, Icons.home_outlined, context.l10n.t('Navigation.home')),
    _NavDef(Icons.search_rounded, Icons.search_outlined, context.l10n.t('Navigation.search')),
    _NavDef(Icons.chat_bubble_rounded, Icons.chat_bubble_outline_rounded, context.l10n.t('Navigation.messages')),
    _NavDef(Icons.person_rounded, Icons.person_outline_rounded, context.l10n.t('Navigation.profile')),
  ];

  void _onTap(int i) {
    HapticFeedback.selectionClick();
    if (i != _currentIndex) {
      setState(() => _currentIndex = i);
      context.go(_tabs[i]);
    }
  }

  bool _onScroll(ScrollNotification notification) {
    if (notification is ScrollUpdateNotification) {
      final delta = notification.scrollDelta ?? 0;
      if (delta > 0 && _navVisible) {
        setState(() => _navVisible = false);
      } else if (delta < 0 && !_navVisible) {
        setState(() => _navVisible = true);
      }
    }
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final chat = Provider.of<ChatProvider>(context);

    if (auth.currentUser != null && !_chatInitialized) {
      _chatInitialized = true;
      final np = context.read<NotificationProvider>();
      chat.onNewNotification = () => np.fetchUnreadCount();
      np.startPolling();
      WidgetsBinding.instance.addPostFrameCallback((_) {
        chat.init(auth.currentUser!.id, userName: auth.currentUser!.name);
      });
    }
    if (auth.currentUser == null && _chatInitialized) {
      _chatInitialized = false;
      chat.reset();
      context.read<NotificationProvider>().reset();
    }

    final chatOpen = chat.activeConversationId != null;
    final effectiveNavVisible = _navVisible && !chatOpen;

    final base = _baseItems(context);
    final items = [
      base[0],
      base[1],
      _NavDef(
        base[2].activeIcon,
        base[2].inactiveIcon,
        base[2].label,
        badgeCount: chat.totalUnreadCount,
      ),
      base[3],
    ];

    return Scaffold(
      body: Stack(
        clipBehavior: Clip.none,
        children: [
          AnimatedPadding(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            padding: EdgeInsets.only(bottom: effectiveNavVisible ? 96 : 0),
            child: NotificationListener<ScrollNotification>(
              onNotification: _onScroll,
              child: widget.child,
            ),
          ),
          AnimatedPositioned(
            duration: const Duration(milliseconds: 250),
            curve: Curves.easeInOut,
            left: 0,
            right: 0,
            bottom: effectiveNavVisible ? 20 : -120,
            child: _FloatingNavBar(
              currentIndex: _currentIndex,
              items: items,
              onTap: _onTap,
              onPostTap: () {
                HapticFeedback.mediumImpact();
                context.push('/create-ad');
              },
            ),
          ),
        ],
      ),
    );
  }
}

const double _fabSize = 52;

class _FloatingNavBar extends StatelessWidget {
  final int currentIndex;
  final List<_NavDef> items;
  final void Function(int) onTap;
  final VoidCallback onPostTap;

  const _FloatingNavBar({
    required this.currentIndex,
    required this.items,
    required this.onTap,
    required this.onPostTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final navColor = isDark ? const Color(0xFF1C1C1E) : AppTheme.surfaceColor;

    return SizedBox(
      height: 64,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Center(
            child: Container(
              width: MediaQuery.of(context).size.width * 0.92,
              height: 64,
              decoration: BoxDecoration(
                color: navColor,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.12),
                    blurRadius: 24,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(child: Center(child: _NavItem(def: items[0], selected: currentIndex == 0, onTap: () => onTap(0)))),
                  Expanded(child: Center(child: _NavItem(def: items[1], selected: currentIndex == 1, onTap: () => onTap(1)))),
                  const SizedBox(width: 44),
                  Expanded(child: Center(child: _NavItem(def: items[2], selected: currentIndex == 2, onTap: () => onTap(2)))),
                  Expanded(child: Center(child: _NavItem(def: items[3], selected: currentIndex == 3, onTap: () => onTap(3)))),
                ],
              ),
            ),
          ),
          Positioned(
            top: -22,
            left: 0,
            right: 0,
            child: Center(child: _FloatingAddButton(onTap: onPostTap)),
          ),
        ],
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final _NavDef def;
  final bool selected;
  final VoidCallback onTap;

  const _NavItem({required this.def, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    const primaryColor = AppTheme.primaryColor;
    final inactiveColor = theme.colorScheme.onSurface.withValues(alpha: 0.55);

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 250),
        curve: Curves.easeInOut,
        width: 44,
        height: 44,
        decoration: BoxDecoration(
          color: selected ? primaryColor.withValues(alpha: 0.12) : Colors.transparent,
          borderRadius: BorderRadius.circular(14),
        ),
        child: AnimatedScale(
          scale: selected ? 1.1 : 1.0,
          duration: const Duration(milliseconds: 250),
          curve: Curves.easeInOut,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Center(
                child: Icon(
                  selected ? def.activeIcon : def.inactiveIcon,
                  color: selected ? primaryColor : inactiveColor,
                  size: 22,
                ),
              ),
              if (def.badgeCount > 0 && !selected)
                Positioned(
                  right: 2,
                  top: 2,
                  child: Container(
                    width: 18,
                    height: 18,
                    decoration: const BoxDecoration(color: AppTheme.redColor, shape: BoxShape.circle),
                    child: Center(
                      child: Text(
                        def.badgeCount > 9 ? '9+' : '${def.badgeCount}',
                        style: const TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _FloatingAddButton extends StatefulWidget {
  final VoidCallback onTap;
  const _FloatingAddButton({required this.onTap});

  @override
  State<_FloatingAddButton> createState() => _FloatingAddButtonState();
}

class _FloatingAddButtonState extends State<_FloatingAddButton> with SingleTickerProviderStateMixin {
  late final AnimationController _ctrl;
  late final Animation<double> _scale;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(vsync: this, duration: const Duration(milliseconds: 150));
    _scale = Tween<double>(begin: 1.0, end: 0.88).animate(
      CurvedAnimation(parent: _ctrl, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() { _ctrl.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTapDown: (_) => _ctrl.forward(),
      onTapUp: (_) {
        _ctrl.reverse();
        widget.onTap();
      },
      onTapCancel: () => _ctrl.reverse(),
      child: ScaleTransition(
        scale: _scale,
        child: Container(
          width: _fabSize,
          height: _fabSize,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: const LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [AppTheme.primaryLightColor, AppTheme.primaryColor],
            ),
            boxShadow: [
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.4),
                blurRadius: 8,
                offset: const Offset(0, 3),
              ),
              BoxShadow(
                color: AppTheme.primaryColor.withValues(alpha: 0.15),
                blurRadius: 20,
                offset: const Offset(0, 6),
              ),
            ],
          ),
          child: const Icon(Icons.add_rounded, color: Colors.white, size: 26),
        ),
      ),
    );
  }
}

class _NavDef {
  final IconData activeIcon;
  final IconData inactiveIcon;
  final String label;
  final int badgeCount;
  const _NavDef(this.activeIcon, this.inactiveIcon, this.label, {this.badgeCount = 0});
}
