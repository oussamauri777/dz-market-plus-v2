import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class AppDropdown extends StatelessWidget {
  final String? value;
  final List<DropdownMenuItem<String>> items;
  final String? hint;
  final String? label;
  final IconData? prefixIcon;
  final void Function(String?)? onChanged;
  final String? Function(String?)? validator;

  const AppDropdown({
    super.key,
    this.value,
    required this.items,
    this.hint,
    this.label,
    this.prefixIcon,
    this.onChanged,
    this.validator,
  });

  @override
  Widget build(BuildContext context) {
    return DropdownButtonFormField<String>(
      value: value,
      items: items,
      onChanged: onChanged,
      validator: validator,
      isDense: true,
      decoration: InputDecoration(
        hintText: hint,
        labelText: label,
        prefixIcon: prefixIcon != null
            ? SizedBox(
                width: 36,
                child: Icon(prefixIcon, size: 18, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
              )
            : null,
        filled: true,
        fillColor: Theme.of(context).cardColor,
        contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 12),
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
        hintStyle: TextStyle(color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55), fontSize: 14, overflow: TextOverflow.ellipsis),
      ),
      style: TextStyle(
        fontSize: 14,
        color: Theme.of(context).colorScheme.onSurface,
      ),
      dropdownColor: Theme.of(context).cardColor,
      icon: Icon(Icons.keyboard_arrow_down, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
    );
  }
}
