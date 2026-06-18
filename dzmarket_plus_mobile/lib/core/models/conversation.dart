class Conversation {
  final String id;
  final List<dynamic> participants;
  final String? lastMessage;
  final DateTime? lastMessageAt;
  final String? adId;
  final String? adTitle;
  final String? adImage;
  final int unreadCount;

  const Conversation({
    required this.id,
    required this.participants,
    this.lastMessage,
    this.lastMessageAt,
    this.adId,
    this.adTitle,
    this.adImage,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    final adJson = json['ad'];
    String? adId;
    String? adTitle;
    String? adImage;
    if (adJson is Map) {
      adId = adJson['_id'] ?? '';
      adTitle = adJson['title'] ?? '';
      final images = adJson['images'] as List?;
      if (images != null && images.isNotEmpty) {
        adImage = images.first.toString();
      }
    }

    return Conversation(
      id: json['_id'] ?? '',
      participants: json['participants'] ?? [],
      lastMessage: json['lastMessage'],
      lastMessageAt: json['lastMessageAt'] != null
          ? DateTime.tryParse(json['lastMessageAt'])
          : null,
      adId: adId,
      adTitle: adTitle,
      adImage: adImage,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'participants': participants,
    'lastMessage': lastMessage,
    'lastMessageAt': lastMessageAt?.toIso8601String(),
    'ad': {
      '_id': adId,
      'title': adTitle,
      'images': adImage != null ? [adImage] : [],
    },
    'unreadCount': unreadCount,
  };
}
