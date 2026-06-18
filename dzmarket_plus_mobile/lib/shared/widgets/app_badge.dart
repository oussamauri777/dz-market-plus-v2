import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum AppBadgeVariant { primary, yellow, red, green, blue, orange, indigo }

class AppBadge extends StatelessWidget {
  final String label;
  final AppBadgeVariant variant;
  final IconData? icon;
  final double fontSize;

  const AppBadge({
    super.key,
    required this.label,
    this.variant = AppBadgeVariant.primary,
    this.icon,
    this.fontSize = 11,
  });

  @override
  Widget build(BuildContext context) {
    final colors = _colors;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: colors.bg,
        borderRadius: BorderRadius.circular(AppTheme.radiusFull),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 12, color: colors.fg),
            const SizedBox(width: 3),
          ],
          Text(
            label,
            style: TextStyle(
              fontSize: fontSize,
              fontWeight: FontWeight.bold,
              color: colors.fg,
            ),
          ),
        ],
      ),
    );
  }

  ({Color bg, Color fg}) get _colors {
    switch (variant) {
      case AppBadgeVariant.primary:
        return (bg: AppTheme.primaryColor, fg: Colors.white);
      case AppBadgeVariant.yellow:
        return (bg: AppTheme.yellowLightColor, fg: const Color(0xFF854D0E));
      case AppBadgeVariant.red:
        return (bg: AppTheme.redColor, fg: Colors.white);
      case AppBadgeVariant.green:
        return (bg: AppTheme.greenLightColor, fg: const Color(0xFF166534));
      case AppBadgeVariant.blue:
        return (bg: AppTheme.blueLightColor, fg: AppTheme.blueColor);
      case AppBadgeVariant.orange:
        return (bg: AppTheme.orangeLightColor, fg: AppTheme.orangeColor);
      case AppBadgeVariant.indigo:
        return (bg: const Color(0xFFEEF2FF), fg: const Color(0xFF4338CA));
    }
  }
}
