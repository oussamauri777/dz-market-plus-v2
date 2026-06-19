import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/login_screen.dart';
import '../../features/auth/register_screen.dart';
import '../../features/auth/forgot_password_screen.dart';
import '../../features/auth/reset_password_screen.dart';
import '../../features/notifications/notifications_screen.dart';
import '../../features/home/home_screen.dart';
import '../../features/search/search_screen.dart';
import '../../features/ads/ad_detail_screen.dart';
import '../../features/ads/create_ad_screen.dart';
import '../../features/profile/profile_screen.dart';
import '../../features/profile/seller_profile_screen.dart';
import '../../features/profile/edit_profile_screen.dart';
import '../../features/profile/change_password_screen.dart';
import '../../features/profile/phone_number_screen.dart';
import '../../features/profile/notifications_settings_screen.dart';
import '../../features/profile/help_support_screen.dart';
import '../../features/profile/about_screen.dart';
import '../../features/messages/messages_screen.dart';
import '../../features/favorites/favorites_screen.dart';
import '../../features/onboarding/onboarding_screen.dart';
import '../../features/admin/admin_screen.dart';
import '../../shared/widgets/main_scaffold.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>();
final _shellNavigatorKey = GlobalKey<NavigatorState>();
String? _pendingNotificationConversationId;

bool onboardingComplete = false;

void navigateToConversation(String conversationId, {String? partner}) {
  final context = _shellNavigatorKey.currentContext;
  if (context != null && context.mounted) {
    final uri = StringBuffer('/messages?conversationId=$conversationId');
    if (partner != null) {
      uri.write('&partner=${Uri.encodeComponent(partner)}');
    }
    context.go(uri.toString());
  } else {
    _pendingNotificationConversationId = conversationId;
  }
}

final GoRouter appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/',
  redirect: (context, state) {
    final loc = state.matchedLocation;
    if (!onboardingComplete && loc != '/onboarding') return '/onboarding';
    if (onboardingComplete && loc == '/onboarding') return '/';
    return null;
  },
  routes: [
    // Onboarding (no shell)
    GoRoute(
      path: '/onboarding',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const OnboardingScreen(),
    ),
    // Main shell with bottom nav
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        if (_pendingNotificationConversationId != null) {
          WidgetsBinding.instance.addPostFrameCallback((_) {
            final id = _pendingNotificationConversationId;
            _pendingNotificationConversationId = null;
            if (id != null) navigateToConversation(id);
          });
        }
        return MainScaffold(child: child);
      },
      routes: [
        GoRoute(
          path: '/',
          pageBuilder: (context, state) => const NoTransitionPage(child: HomeScreen()),
        ),
        GoRoute(
          path: '/search',
          pageBuilder: (context, state) {
            final query = state.uri.queryParameters['query'] ?? '';
            final category = state.uri.queryParameters['category'] ?? '';
            final subcategory = state.uri.queryParameters['subcategory'] ?? '';
            final wilaya = state.uri.queryParameters['wilaya'] ?? '';
            final ai = state.uri.queryParameters['ai'] == 'true';
            return NoTransitionPage(
              child: SearchScreen(query: query, category: category, subcategory: subcategory, wilaya: wilaya, ai: ai),
            );
          },
        ),
        GoRoute(
          path: '/favorites',
          pageBuilder: (context, state) => const NoTransitionPage(child: FavoritesScreen()),
        ),
        GoRoute(
          path: '/messages',
          pageBuilder: (context, state) {
            final partner = state.uri.queryParameters['partner'];
            final conversationId = state.uri.queryParameters['conversationId'];
            return NoTransitionPage(child: MessagesScreen(
              initialChatPartner: partner,
              initialConversationId: conversationId,
            ));
          },
        ),
        GoRoute(
          path: '/profile',
          pageBuilder: (context, state) => const NoTransitionPage(child: ProfileScreen()),
        ),
      ],
    ),
    // Auth routes (no shell)
    GoRoute(
      path: '/login',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/register',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const RegisterScreen(),
    ),
    GoRoute(
      path: '/forgot-password',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const ForgotPasswordScreen(),
    ),
    GoRoute(
      path: '/reset-password',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => ResetPasswordScreen(token: state.uri.queryParameters['token'] ?? ''),
    ),
    // Ad detail (no shell)
    GoRoute(
      path: '/notifications',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/ads/:id',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => AdDetailScreen(adId: state.pathParameters['id']!),
    ),
    // Seller profile (no shell)
    GoRoute(
      path: '/user/:id',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => SellerProfileScreen(userId: state.pathParameters['id']!),
    ),
    // Create Ad (no shell)
    GoRoute(
      path: '/create-ad',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const CreateAdScreen(),
    ),
    // Profile settings (no shell)
    GoRoute(
      path: '/edit-profile',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const EditProfileScreen(),
    ),
    GoRoute(
      path: '/change-password',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const ChangePasswordScreen(),
    ),
    GoRoute(
      path: '/phone-number',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const PhoneNumberScreen(),
    ),
    GoRoute(
      path: '/notifications-settings',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const NotificationsSettingsScreen(),
    ),
    GoRoute(
      path: '/help-support',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const HelpSupportScreen(),
    ),
    GoRoute(
      path: '/about',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const AboutScreen(),
    ),
    // Admin (no shell)
    GoRoute(
      path: '/admin',
      parentNavigatorKey: _rootNavigatorKey,
      builder: (context, state) => const AdminScreen(),
    ),
  ],
);
