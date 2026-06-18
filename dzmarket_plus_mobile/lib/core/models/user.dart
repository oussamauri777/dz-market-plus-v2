class UserBadges {
  final bool emailVerified;
  final bool phoneVerified;
  final bool identityVerified;

  const UserBadges({
    this.emailVerified = false,
    this.phoneVerified = false,
    this.identityVerified = false,
  });

  factory UserBadges.fromJson(Map<String, dynamic> json) {
    return UserBadges(
      emailVerified: json['emailVerified'] ?? false,
      phoneVerified: json['phoneVerified'] ?? false,
      identityVerified: json['identityVerified'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'emailVerified': emailVerified,
    'phoneVerified': phoneVerified,
    'identityVerified': identityVerified,
  };
}

class UserModel {
  final String id;
  final String name;
  final String email;
  final String role;
  final String? image;
  final String? phone;
  final String? wilaya;
  final String? bio;
  final List<String> viewedCategories;
  final List<String> recentlyViewedAds;
  final UserBadges badges;
  final List<String> favorites;
  final DateTime? lastPostDate;
  final DateTime createdAt;
  final DateTime updatedAt;

  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    this.role = 'buyer',
    this.image,
    this.phone,
    this.wilaya,
    this.bio,
    this.viewedCategories = const [],
    this.recentlyViewedAds = const [],
    this.badges = const UserBadges(),
    this.favorites = const [],
    this.lastPostDate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['_id'] ?? json['id'] ?? '',
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'buyer',
      image: json['image'],
      phone: json['phone'],
      wilaya: json['wilaya'],
      bio: json['bio'],
      viewedCategories: List<String>.from(json['viewedCategories'] ?? []),
      recentlyViewedAds: List<String>.from(json['recentlyViewedAds'] ?? []),
      badges: json['badges'] != null
          ? UserBadges.fromJson(json['badges'])
          : const UserBadges(),
      favorites: List<String>.from(
        (json['favorites'] as List<dynamic>?)?.map((e) => e.toString()) ?? [],
      ),
      lastPostDate: json['lastPostDate'] != null
          ? DateTime.tryParse(json['lastPostDate'])
          : null,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'name': name,
    'email': email,
    'role': role,
    'image': image,
    'phone': phone,
    'wilaya': wilaya,
    'bio': bio,
    'badges': badges.toJson(),
  };

  bool get isVerified => badges.emailVerified;
  bool get isSeller => role == 'seller';
}
