class Message {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String content;
  final String type;
  final String? fileUrl;
  final String? fileName;
  final bool read;
  final DateTime createdAt;

  const Message({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.content = '',
    this.type = 'text',
    this.fileUrl,
    this.fileName,
    this.read = false,
    required this.createdAt,
  });

  factory Message.fromJson(Map<String, dynamic> json) {
    final senderObj = json['sender'];
    String senderId;
    String senderName;
    if (senderObj is Map) {
      senderId = senderObj['_id'] ?? '';
      senderName = senderObj['name'] ?? 'Unknown';
    } else {
      senderId = senderObj?.toString() ?? '';
      senderName = 'Unknown';
    }

    final convObj = json['conversation'];
    final convId = convObj is Map ? convObj['_id'] ?? '' : convObj?.toString() ?? '';

    return Message(
      id: json['_id'] ?? '',
      conversationId: convId,
      senderId: senderId,
      senderName: senderName,
      content: json['content'] ?? '',
      type: json['type'] ?? 'text',
      fileUrl: json['fileUrl'],
      fileName: json['fileName'],
      read: json['read'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt']) ?? DateTime.now()
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() => {
    '_id': id,
    'conversation': conversationId,
    'sender': senderId,
    'content': content,
    'type': type,
    'fileUrl': fileUrl,
    'fileName': fileName,
    'read': read,
    'createdAt': createdAt.toIso8601String(),
  };

  bool get isMine => false; // Set externally by comparing with current user ID

  String get timeFormatted {
    final now = DateTime.now();
    final diff = now.difference(createdAt);
    if (diff.inDays > 0) {
      return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
    }
    final hour = createdAt.hour.toString().padLeft(2, '0');
    final minute = createdAt.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }
}
