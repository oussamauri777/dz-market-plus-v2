import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

enum AppButtonVariant { primary, yellow, outline, danger, text }

class AppButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final AppButtonVariant variant;
  final IconData? icon;
  final bool isLoading;
  final bool fullWidth;
  final double? height;

  const AppButton({
    super.key,
    required this.label,
    this.onPressed,
    this.variant = AppButtonVariant.primary,
    this.icon,
    this.isLoading = false,
    this.fullWidth = true,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final effectiveHeight = height ?? 52.0;

    switch (variant) {
      case AppButtonVariant.primary:
        return _buildElevated(
          context,
          bgColor: AppTheme.primaryColor,
          textColor: Colors.white,
          height: effectiveHeight,
        );
      case AppButtonVariant.yellow:
        return _buildElevated(
          context,
          bgColor: AppTheme.yellowColor,
          textColor: const Color(0xFF1A1A1A),
          height: effectiveHeight,
          shadows: AppTheme.shadowYellow,
        );
      case AppButtonVariant.outline:
        return _buildOutlined(context, effectiveHeight);
      case AppButtonVariant.danger:
        return _buildElevated(
          context,
          bgColor: AppTheme.redColor,
          textColor: Colors.white,
          height: effectiveHeight,
        );
      case AppButtonVariant.text:
        return _buildText(context, effectiveHeight);
    }
  }

  Widget _buildElevated(
    BuildContext context, {
    required Color bgColor,
    required Color textColor,
    required double height,
    List<BoxShadow>? shadows,
  }) {
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: height,
      child: ElevatedButton(
        onPressed: isLoading ? null : onPressed,
        style: ElevatedButton.styleFrom(
          backgroundColor: bgColor,
          foregroundColor: textColor,
          elevation: 0,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24),
        ).copyWith(
          shadowColor: WidgetStateProperty.all(Colors.transparent),
        ),
        child: _buildContent(textColor),
      ),
    );
  }

  Widget _buildOutlined(BuildContext context, double height) {
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: height,
      child: OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: AppTheme.primaryColor,
          side: const BorderSide(color: AppTheme.primaryColor, width: 1.5),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(AppTheme.radiusMd),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 24),
        ),
        child: _buildContent(AppTheme.primaryColor),
      ),
    );
  }

  Widget _buildText(BuildContext context, double height) {
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      height: height,
      child: TextButton(
        onPressed: onPressed,
        style: TextButton.styleFrom(
          foregroundColor: AppTheme.primaryColor,
          textStyle: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w600,
          ),
        ),
        child: _buildContent(AppTheme.primaryColor),
      ),
    );
  }

  Widget _buildContent(Color textColor) {
    if (isLoading) {
      return const SizedBox(
        width: 22,
        height: 22,
        child: CircularProgressIndicator(
          strokeWidth: 2.5,
          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 18),
          const SizedBox(width: 8),
          Text(
            label,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      );
    }

    return Text(
      label,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
    );
  }
}
