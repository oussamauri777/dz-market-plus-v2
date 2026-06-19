import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../core/theme/app_theme.dart';
import '../../core/localization/app_localizations.dart';
import '../../core/services/api_service.dart';
import '../../shared/widgets/empty_state.dart';
import '../../shared/widgets/confirmation_dialog.dart';

class AdminUsersTab extends StatefulWidget {
  const AdminUsersTab({super.key});
  @override
  State<AdminUsersTab> createState() => _AdminUsersTabState();
}

class _AdminUsersTabState extends State<AdminUsersTab> {
  List<dynamic> _users = [];
  bool _loading = true;
  String? _error;
  int _page = 1;
  bool _hasMore = true;
  final _searchCtrl = TextEditingController();
  String _search = '';

  @override
  void initState() {
    super.initState();
    _loadUsers();
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadUsers({bool append = false}) async {
    if (!append) setState(() { _loading = true; _error = null; });
    try {
      final data = await ApiService.getAdminUsers(page: _page, search: _search);
      final users = data['users'] ?? data['data'] ?? [];
      final total = data['pagination']?['total'] ?? 0;
      if (mounted) {
        setState(() {
          if (append) { _users.addAll(List.from(users)); } else { _users = List.from(users); }
          _hasMore = _users.length < total;
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() { _error = e.toString(); _loading = false; });
    }
  }

  Future<void> _changeRole(String userId, String role) async {
    try {
      await ApiService.updateUserRole(userId, role);
      _loadUsers();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
      }
    }
  }

  Future<void> _deleteUser(String userId, String name) async {
    ConfirmationDialog.show(
      context,
      title: 'Supprimer $name ?',
      message: 'Cette action est irréversible. Toutes les annonces de cet utilisateur seront également supprimées.',
      confirmLabel: 'Supprimer',
      isDestructive: true,
      onConfirm: () async {
        try {
          await ApiService.deleteUser(userId);
          _loadUsers();
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('$name a été supprimé')),
            );
          }
        } catch (e) {
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
          }
        }
      },
    );
  }

  void _onSearch(String v) {
    _search = v;
    _page = 1;
    _loadUsers();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
          child: TextField(
            controller: _searchCtrl,
            decoration: InputDecoration(
              hintText: 'Rechercher par nom ou email...',
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: _searchCtrl.text.isNotEmpty
                  ? IconButton(icon: const Icon(Icons.clear), onPressed: () { _searchCtrl.clear(); _onSearch(''); })
                  : null,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16),
            ),
            onChanged: _onSearch,
          ),
        ),
        Expanded(
          child: _buildBody(),
        ),
      ],
    );
  }

  Widget _buildBody() {
    if (_loading) return const Center(child: CircularProgressIndicator());
    if (_error != null) {
      return EmptyState(
        icon: Icons.error_outline_rounded,
        title: 'Erreur',
        subtitle: _error,
        buttonLabel: 'Réessayer',
        onButtonTap: () => _loadUsers(),
      );
    }
    if (_users.isEmpty) {
      return const EmptyState(
        icon: Icons.people_outline_rounded,
        title: 'Aucun utilisateur',
      );
    }

    return RefreshIndicator(
      onRefresh: () async { _page = 1; await _loadUsers(); },
      child: ListView.builder(
        itemCount: _users.length + (_hasMore ? 1 : 0),
        itemBuilder: (ctx, i) {
          if (i == _users.length) {
            return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator(strokeWidth: 2)));
          }
          return _UserTile(
            user: _users[i],
            onRoleChanged: (role) => _changeRole(_users[i]['_id'] ?? _users[i]['id'], role),
            onDelete: () => _deleteUser(_users[i]['_id'] ?? _users[i]['id'], _users[i]['name'] ?? ''),
          );
        },
      ),
    );
  }
}

class _UserTile extends StatelessWidget {
  final Map<String, dynamic> user;
  final void Function(String role) onRoleChanged;
  final VoidCallback onDelete;

  const _UserTile({required this.user, required this.onRoleChanged, required this.onDelete});

  @override
  Widget build(BuildContext context) {
    final name = user['name'] ?? 'Inconnu';
    final email = user['email'] ?? '';
    final role = user['role'] ?? 'user';
    final image = user['image'];
    final phone = user['phone'];
    final wilaya = user['wilaya'];
    final createdAt = user['createdAt'] != null ? DateTime.parse(user['createdAt']).toLocal().toString().split(' ')[0] : '';

    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                CircleAvatar(
                  radius: 22,
                  backgroundColor: AppTheme.primaryColor.withValues(alpha: 0.12),
                  backgroundImage: image != null ? CachedNetworkImageProvider(image) : null,
                  child: image == null
                      ? Text(name.isNotEmpty ? name[0].toUpperCase() : '?',
                          style: const TextStyle(color: AppTheme.primaryColor, fontWeight: FontWeight.w700))
                      : null,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(name, style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.onSurface)),
                      Text(email, style: TextStyle(fontSize: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55))),
                    ],
                  ),
                ),
                PopupMenuButton<String>(
                  icon: Icon(Icons.more_vert_rounded, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
                  onSelected: (v) {
                    if (v == 'admin') onRoleChanged('admin');
                    if (v == 'user') onRoleChanged('user');
                    if (v == 'seller') onRoleChanged('seller');
                    if (v == 'delete') onDelete();
                  },
                  itemBuilder: (ctx) => [
                    if (role != 'admin') const PopupMenuItem(value: 'admin', child: Text('Promouvoir admin')),
                    if (role != 'user') const PopupMenuItem(value: 'user', child: Text('Rétrograder → user')),
                    if (role != 'seller') const PopupMenuItem(value: 'seller', child: Text('Définir → seller')),
                    const PopupMenuDivider(),
                    const PopupMenuItem(value: 'delete', child: Text('Supprimer', style: TextStyle(color: AppTheme.redColor))),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _InfoChip(Icons.badge_rounded, role),
                if (phone != null) ...[const SizedBox(width: 8), _InfoChip(Icons.phone_rounded, phone)],
                if (wilaya != null) ...[const SizedBox(width: 8), _InfoChip(Icons.location_on_rounded, wilaya)],
              ],
            ),
            if (createdAt.isNotEmpty) ...[
              const SizedBox(height: 4),
              Text('Inscrit le $createdAt', style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.4))),
            ],
          ],
        ),
      ),
    );
  }
}

class _InfoChip extends StatelessWidget {
  final IconData icon;
  final String label;
  const _InfoChip(this.icon, this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: BorderRadius.circular(6),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 12, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.55)),
          const SizedBox(width: 4),
          Text(label, style: TextStyle(fontSize: 11, color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.7))),
        ],
      ),
    );
  }
}
