class Review {
  final String id;
  final int rating;
  final String comment;
  final String buyerId;
  final String? buyerName;
  final String? buyerImage;
  final String sellerId;
  final String adId;
  final String? adTitle;
  final DateTime createdAt;

  const Review({
    required this.id,
    required this.rating,
    required this.comment,
    required this.buyerId,
    this.buyerName,
    this.buyerImage,
    required this.sellerId,
    required this.adId,
    this.adTitle,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    final buyerObj = json['buyer'];
    String? buyerId;
    String? buyerName;
    String? buyerImage;
    if (buyerObj is Map) {
      buyerId = buyerObj['_id'] ?? '';
      buyerName = buyerObj['name'];
      buyerImage = buyerObj['image'];
    } else {
      buyerId = buyerObj?.toString() ?? '';
    }

    final adObj = json['ad'];
    String? adId;
    String? adTitle;
    if (adObj is Map) {
      adId = adObj['_id'] ?? '';
      adTitle = adObj['title'];
    } else {
      adId = adObj?.toString() ?? '';
    }

    final sellerObj = json['seller'];
    final sellerId = sellerObj is Map ? sellerObj['_id'] ?? '' : sellerObj?.toString() ?? '';

    return Review(
      id: json['_id'] ?? '',
      rating: json['rating'] ?? 5,
      comment: json['comment'] ?? '',
      buyerId: buyerId ?? '',
      buyerName: buyerName,
      buyerImage: buyerImage,
      sellerId: sellerId,
      adId: adId ?? '',
      adTitle: adTitle,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'rating': rating,
    'comment': comment,
    'buyer': buyerId,
    'seller': sellerId,
    'ad': adId,
  };

  String get timeAgo {
    final diff = DateTime.now().difference(createdAt);
    if (diff.inDays > 30) return 'il y a ${(diff.inDays / 30).floor()} mois';
    if (diff.inDays > 0) return 'il y a ${diff.inDays}j';
    if (diff.inHours > 0) return 'il y a ${diff.inHours}h';
    return 'À l\'instant';
  }
}
