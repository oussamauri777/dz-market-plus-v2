class Ad {
  final String id;
  final String title;
  final double price;
  final String currency;
  final String wilaya;
  final String category;
  final String? subcategory;
  final List<String> images;
  final String description;
  final String userId;
  final String userName;
  final String? userImage;
  final DateTime createdAt;
  final bool isSold;
  final bool isNegotiable;
  final int viewCount;
  final String? commune;
  final Map<String, dynamic>? location;
  final String? condition;
  final String status;
  final List<double>? embedding;

  const Ad({
    required this.id,
    required this.title,
    required this.price,
    this.currency = 'DZD',
    required this.wilaya,
    required this.category,
    this.subcategory,
    required this.images,
    required this.description,
    required this.userId,
    required this.userName,
    this.userImage,
    required this.createdAt,
    this.isSold = false,
    this.isNegotiable = false,
    this.viewCount = 0,
    this.commune,
    this.location,
    this.condition,
    this.status = 'active',
    this.embedding,
  });

  factory Ad.fromJson(Map<String, dynamic> json) {
    return Ad(
      id: json['_id'] ?? json['id'] ?? '',
      title: json['title'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      currency: json['currency'] ?? 'DZD',
      wilaya: json['wilaya'] ?? '',
      category: json['category'] ?? '',
      subcategory: json['subcategory'],
      images: List<String>.from(json['images'] ?? []),
      description: json['description'] ?? '',
      userId: json['userId'] ?? '',
      userName: json['userName'] ?? '',
      userImage: json['userImage'],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
      isSold: json['isSold'] ?? json['status'] == 'sold',
      isNegotiable: json['isNegotiable'] ?? false,
      viewCount: json['viewCount'] ?? json['views'] ?? 0,
      commune: json['location'] is Map ? json['location']['commune'] : null,
      location: json['location'] != null ? Map<String, dynamic>.from(json['location']) : null,
      condition: json['condition'],
      status: json['status'] ?? 'active',
      embedding: json['embedding'] != null
          ? List<double>.from(json['embedding'])
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'price': price,
      'currency': currency,
      'wilaya': wilaya,
      'category': category,
      'subcategory': subcategory,
      'images': images,
      'description': description,
      'userId': userId,
      'userName': userName,
      'userImage': userImage,
      'createdAt': createdAt.toIso8601String(),
      'isSold': isSold,
      'isNegotiable': isNegotiable,
      'viewCount': viewCount,
      'commune': commune,
      'location': location,
      'condition': condition,
      'status': status,
      'embedding': embedding,
    };
  }

  String get formattedPrice {
    if (price == 0) return 'Prix à négocier';
    final formatted = price.toStringAsFixed(0).replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (m) => '${m[1]} ',
    );
    return '$formatted DA';
  }

  String get timeAgo {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inDays > 30) return '${(diff.inDays / 30).floor()} mois';
    if (diff.inDays > 0) return 'il y a ${diff.inDays}j';
    if (diff.inHours > 0) return 'il y a ${diff.inHours}h';
    return 'À l\'instant';
  }
}
