import { FlutterCodeFile } from '../types';

export const FLUTTER_CODEBASE: FlutterCodeFile[] = [
  {
    path: 'pubspec.yaml',
    name: 'pubspec.yaml',
    category: 'config',
    description: 'Dependencies configuration including camera, model_viewer_plus, google_fonts, and flutter_svg',
    code: `name: golem_ai
description: "GOLEM - Local AI 3D-Generator Holographic Companion App"
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.2.0 <4.0.0'
  flutter: ">=3.16.0"

dependencies:
  flutter:
    sdk: flutter

  # Icons & Styling
  cupertino_icons: ^1.0.8
  google_fonts: ^6.1.0
  flutter_animate: ^4.5.0
  
  # Camera & Hardware
  camera: ^0.10.5+9
  path_provider: ^2.1.2
  path: ^1.9.0

  # 3D Model Rendering (Placeholder target)
  model_viewer_plus: ^1.7.0

  # State & Utilities
  intl: ^0.19.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
  assets:
    - assets/models/
    - assets/icons/
`
  },
  {
    path: 'lib/main.dart',
    name: 'main.dart',
    category: 'core',
    description: 'Application entry point initializing camera subsystem, high-tech theme, and ChatScreen',
    code: `import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:camera/camera.dart';
import 'theme/golem_theme.dart';
import 'screens/chat_screen.dart';

// Global camera descriptions list initialized before runApp
List<CameraDescription> availableCamerasList = [];

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // Lock status bar and navigation bar to high-tech cyberpunk deep dark tone
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: GolemTheme.backgroundBlack,
      systemNavigationBarIconBrightness: Brightness.light,
    ),
  );

  try {
    // Probe available system cameras
    availableCamerasList = await availableCameras();
  } catch (e) {
    debugPrint('GOLEM Subsystem: Cameras initialization error: $e');
  }

  runApp(const GolemCompanionApp());
}

class GolemCompanionApp extends StatelessWidget {
  const GolemCompanionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'GOLEM // AI 3D Guardian',
      debugShowCheckedModeBanner: false,
      theme: GolemTheme.darkHoloTheme,
      home: const ChatScreen(),
    );
  }
}
`
  },
  {
    path: 'lib/theme/golem_theme.dart',
    name: 'golem_theme.dart',
    category: 'theme',
    description: 'Futuristic color palette, neon electric cyan accents, crystalline borders, and typography',
    code: `import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';

class GolemTheme {
  // Deep Cyberpunk & Holographic Palette
  static const Color backgroundBlack = Color(0xFF030712);
  static const Color surfaceBlack = Color(0xFF0B1120);
  static const Color cardBlack = Color(0xFF0F172A);
  
  // Neon Electric Blue & Crystalline Accents
  static const Color electricCyan = Color(0xFF00F0FF);
  static const Color crystalBlue = Color(0xFF38BDF8);
  static const Color stoneGuardianGrey = Color(0xFF334155);
  static const Color obsidianAccent = Color(0xFF1E293B);
  static const Color neonGlowAlpha = Color(0x3300F0FF);
  
  // HUD Accents
  static const Color hudAmber = Color(0xFFF59E0B);
  static const Color hudSuccessGreen = Color(0xFF10B981);
  static const Color textMuted = Color(0xFF94A3B8);
  static const Color textBright = Color(0xFFF8FAFC);

  static ThemeData get darkHoloTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      scaffoldBackgroundColor: backgroundBlack,
      primaryColor: electricCyan,
      
      colorScheme: const ColorScheme.dark(
        primary: electricCyan,
        secondary: crystalBlue,
        surface: surfaceBlack,
        background: backgroundBlack,
        onPrimary: backgroundBlack,
        onSurface: textBright,
      ),

      textTheme: TextTheme(
        headlineLarge: GoogleFonts.rajdhani(
          fontSize: 28,
          fontWeight: FontWeight.w700,
          color: electricCyan,
          letterSpacing: 2.0,
        ),
        headlineMedium: GoogleFonts.rajdhani(
          fontSize: 22,
          fontWeight: FontWeight.w600,
          color: textBright,
          letterSpacing: 1.5,
        ),
        bodyLarge: GoogleFonts.rajdhani(
          fontSize: 16,
          fontWeight: FontWeight.w500,
          color: textBright,
        ),
        bodyMedium: GoogleFonts.rajdhani(
          fontSize: 14,
          fontWeight: FontWeight.w500,
          color: textMuted,
        ),
        labelSmall: GoogleFonts.jetbrainsMono(
          fontSize: 11,
          fontWeight: FontWeight.w400,
          color: electricCyan.withOpacity(0.8),
          letterSpacing: 1.2,
        ),
      ),

      appBarTheme: AppBarTheme(
        backgroundColor: backgroundBlack.withOpacity(0.95),
        elevation: 0,
        centerTitle: true,
        iconTheme: const IconThemeData(color: electricCyan),
        titleTextStyle: GoogleFonts.rajdhani(
          fontSize: 20,
          fontWeight: FontWeight.w700,
          color: electricCyan,
          letterSpacing: 2.5,
        ),
      ),

      drawerTheme: const DrawerThemeData(
        backgroundColor: surfaceBlack,
        scrimColor: Color(0x99000000),
      ),
    );
  }
}
`
  },
  {
    path: 'lib/models/chat_message.dart',
    name: 'chat_message.dart',
    category: 'models',
    description: 'Data model representing User and GOLEM messages, attachments, and 3D generation payload',
    code: `enum MessageType {
  text,
  model3D,
}

enum SenderType {
  user,
  golem,
}

class ChatMessage {
  final String id;
  final SenderType sender;
  final String content;
  final DateTime timestamp;
  final MessageType type;
  final String? imageAttachmentPath;
  final String? modelAssetPath;
  final Map<String, dynamic>? modelMetadata;

  const ChatMessage({
    required this.id,
    required this.sender,
    required this.content,
    required this.timestamp,
    this.type = MessageType.text,
    this.imageAttachmentPath,
    this.modelAssetPath,
    this.modelMetadata,
  });

  bool get isGolem => sender == SenderType.golem;
  bool get is3DModel => type == MessageType.model3D;

  // 3D Geometry Metadata Accessors
  String get modelName => modelMetadata?['name'] ?? 'Faceted Obsidian Guardian';
  String get polyCount => modelMetadata?['polys'] ?? '12,480 Tris';
  String get renderTime => modelMetadata?['time'] ?? '1.2s local';
  String get fileSize => modelMetadata?['fileSize'] ?? '4.82 MB';
  String get textureComplexity => modelMetadata?['textureComplexity'] ?? '4K PBR (Albedo, Normal, Roughness, AO)';
  String get meshDensity => modelMetadata?['meshDensity'] ?? '28.4 tris/cm²';
  String get dimensions => modelMetadata?['dimensions'] ?? '1.85m × 1.20m × 2.40m';
  String get compression => modelMetadata?['compression'] ?? 'Draco L7 (-64%)';
}
`
  },
  {
    path: 'lib/widgets/faceted_border.dart',
    name: 'faceted_border.dart',
    category: 'widgets',
    description: 'CustomClipper and CustomPainter creating chamfered/faceted crystalline geometry and neon edge strokes',
    code: `import 'package:flutter/material.dart';
import '../theme/golem_theme.dart';

/// CustomClipper cutting chamfered 45-degree angles on corners to evoke
/// carved stone and polygonal crystalline facets.
class FacetedClipper extends CustomClipper<Path> {
  final double cutSize;
  final bool cutTopLeft;
  final bool cutTopRight;
  final bool cutBottomRight;
  final bool cutBottomLeft;

  const FacetedClipper({
    this.cutSize = 12.0,
    this.cutTopLeft = true,
    this.cutTopRight = true,
    this.cutBottomRight = true,
    this.cutBottomLeft = true,
  });

  @override
  Path getClip(Size size) {
    final path = Path();
    final double w = size.width;
    final double h = size.height;

    // Start top-left
    if (cutTopLeft) {
      path.moveTo(cutSize, 0);
    } else {
      path.moveTo(0, 0);
    }

    // Top edge to top-right
    if (cutTopRight) {
      path.lineTo(w - cutSize, 0);
      path.lineTo(w, cutSize);
    } else {
      path.lineTo(w, 0);
    }

    // Right edge to bottom-right
    if (cutBottomRight) {
      path.lineTo(w, h - cutSize);
      path.lineTo(w - cutSize, h);
    } else {
      path.lineTo(w, h);
    }

    // Bottom edge to bottom-left
    if (cutBottomLeft) {
      path.lineTo(cutSize, h);
      path.lineTo(0, h - cutSize);
    } else {
      path.lineTo(0, h);
    }

    // Left edge back to start
    if (cutTopLeft) {
      path.lineTo(0, cutSize);
    }
    path.close();

    return path;
  }

  @override
  bool shouldReclip(covariant FacetedClipper oldClipper) =>
      oldClipper.cutSize != cutSize;
}

/// CustomPainter that renders a glowing neon electric outline along the faceted polygon
class FacetedBorderPainter extends CustomPainter {
  final Color borderColor;
  final double borderWidth;
  final double cutSize;
  final bool showCornerNodes;

  FacetedBorderPainter({
    required this.borderColor,
    this.borderWidth = 1.5,
    this.cutSize = 12.0,
    this.showCornerNodes = true,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = borderColor
      ..style = PaintingStyle.stroke
      ..strokeWidth = borderWidth;

    final path = Path();
    final double w = size.width;
    final double h = size.height;

    path.moveTo(cutSize, 0);
    path.lineTo(w - cutSize, 0);
    path.lineTo(w, cutSize);
    path.lineTo(w, h - cutSize);
    path.lineTo(w - cutSize, h);
    path.lineTo(cutSize, h);
    path.lineTo(0, h - cutSize);
    path.lineTo(0, cutSize);
    path.close();

    // Draw main faceted edge
    canvas.drawPath(path, paint);

    // Subtle corner nodes for high-tech HUD styling
    if (showCornerNodes) {
      final nodePaint = Paint()
        ..color = GolemTheme.electricCyan
        ..style = PaintingStyle.fill;

      canvas.drawCircle(Offset(cutSize, 0), 2.0, nodePaint);
      canvas.drawCircle(Offset(w - cutSize, 0), 2.0, nodePaint);
      canvas.drawCircle(Offset(w, cutSize), 2.0, nodePaint);
      canvas.drawCircle(Offset(w, h - cutSize), 2.0, nodePaint);
      canvas.drawCircle(Offset(w - cutSize, h), 2.0, nodePaint);
      canvas.drawCircle(Offset(cutSize, h), 2.0, nodePaint);
    }
  }

  @override
  bool shouldRepaint(covariant FacetedBorderPainter oldDelegate) => false;
}
`
  },
  {
    path: 'lib/widgets/golem_drawer.dart',
    name: 'golem_drawer.dart',
    category: 'widgets',
    description: 'Left-side navigation drawer featuring glowing polygonal mascot logo, language selector, and memory folders',
    code: `import 'package:flutter/material.dart';
import '../theme/golem_theme.dart';
import 'faceted_border.dart';

class GolemDrawer extends StatefulWidget {
  const GolemDrawer({super.key});

  @override
  State<GolemDrawer> createState() => _GolemDrawerState();
}

class _GolemDrawerState extends State<GolemDrawer> {
  String _selectedLanguage = 'English';
  int _activeTabIndex = 0; // 0 = Vaults & Config, 1 = Synthesis History
  String? _expandedHistoryId;

  final List<Map<String, dynamic>> _storageFolders = [
    {
      'title': 'Generated Models',
      'count': '14 items',
      'icon': Icons.view_in_ar_rounded,
      'code': 'MODELS_DIR',
    },
    {
      'title': 'Blueprints',
      'count': '8 items',
      'icon': Icons.schema_rounded,
      'code': 'PRINTS_DIR',
    },
    {
      'title': 'Exports',
      'count': '22 items',
      'icon': Icons.output_rounded,
      'code': 'EXPORTS_DIR',
    },
  ];

  final List<Map<String, dynamic>> _synthesisHistory = [
    {
      'id': 'hist-001',
      'name': 'Runic Stone Guardian',
      'timestamp': '14:23',
      'fileSize': '4.82 MB',
      'polygons': 12480,
      'vertices': 6420,
      'meshDensity': '28.4 tris/cm²',
      'dimensions': '1.85m × 1.20m × 2.40m',
      'texture': '4K PBR Multi-channel',
      'draco': 'Draco L7 (-64%)',
      'uvChannels': 2,
    },
    {
      'id': 'hist-002',
      'name': 'Cybernetic Monolith Ward',
      'timestamp': '11:10',
      'fileSize': '5.40 MB',
      'polygons': 16840,
      'vertices': 8920,
      'meshDensity': '34.2 tris/cm²',
      'dimensions': '2.40m × 1.10m × 3.20m',
      'texture': '4K PBR Metallic Veins',
      'draco': 'Draco L7 (-65%)',
      'uvChannels': 2,
    },
    {
      'id': 'hist-003',
      'name': 'Crystalline Kinetic Core',
      'timestamp': '12:45',
      'fileSize': '6.75 MB',
      'polygons': 21500,
      'vertices': 11200,
      'meshDensity': '39.8 tris/cm²',
      'dimensions': '1.60m × 1.60m × 1.95m',
      'texture': '4K Ultra-PBR Emissive',
      'draco': 'Draco L7 (-68%)',
      'uvChannels': 3,
    },
  ];

  void _copyHistoryModelJson(Map<String, dynamic> item) {
    final Map<String, dynamic> exportPayload = {
      'modelName': item['name'],
      'format': 'GLB / USDZ',
      'assetPath': 'assets/models/\${item[\'name\'].toString().toLowerCase().replaceAll(RegExp(r\'[^a-z0-9]+\'), \'_\')}.glb',
      'geometryTelemetry': {
        'fileSize': item['fileSize'],
        'polygons': item['polygons'],
        'vertices': item['vertices'],
        'meshDensity': item['meshDensity'],
        'dimensions': item['dimensions'],
        'compression': item['draco'],
        'uvChannels': item['uvChannels'],
      },
      'textureTelemetry': {
        'complexity': item['texture'],
      },
      'synthesizedAt': item['timestamp'],
    };

    Clipboard.setData(ClipboardData(text: const JsonEncoder.withIndent('  ').convert(exportPayload)));
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: GolemTheme.cardBlack,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: GolemTheme.electricCyan, width: 1),
          borderRadius: BorderRadius.circular(4),
        ),
        content: Row(
          children: [
            const Icon(Icons.code_rounded, color: GolemTheme.electricCyan, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Copied Flutter JSON Telemetry for: \${item[\'name\']}',
                style: const TextStyle(
                  color: GolemTheme.textBright,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _shareSynthesisLink(Map<String, dynamic> item) {
    final cleanModelSlug = item['name'].toString().toLowerCase().replaceAll(RegExp(r'[^a-z0-9]+'), '-');
    final queryParams = {
      'synthesis_id': item['id'].toString(),
      'model_name': item['name'].toString(),
      'polygons': item['polygons'].toString(),
      'vertices': item['vertices'].toString(),
      'file_size': item['fileSize'].toString(),
      'mesh_density': item['meshDensity'].toString(),
      'dimensions': item['dimensions'].toString(),
      'compression': item['draco'].toString(),
      'timestamp': item['timestamp'].toString(),
    };
    final queryString = queryParams.entries.map((e) => '\${Uri.encodeComponent(e.key)}=\${Uri.encodeComponent(e.value)}').join('&');
    final shareUrl = 'https://golem-3d.app/#synthesis/\$cleanModelSlug?\$queryString';

    Clipboard.setData(ClipboardData(text: shareUrl));
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: GolemTheme.cardBlack,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: GolemTheme.hudSuccessGreen, width: 1),
          borderRadius: BorderRadius.circular(4),
        ),
        content: Row(
          children: [
            const Icon(Icons.share_rounded, color: GolemTheme.hudSuccessGreen, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Copied Structured 3D Share Link for: \${item[\'name\']}',
                style: const TextStyle(
                  color: GolemTheme.textBright,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showFolderSnackBar(BuildContext context, String folderName) {
    ScaffoldMessenger.of(context).hideCurrentSnackBar();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: GolemTheme.cardBlack,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          side: const BorderSide(color: GolemTheme.electricCyan, width: 1),
          borderRadius: BorderRadius.circular(4),
        ),
        content: Row(
          children: [
            const Icon(Icons.folder_open_rounded, color: GolemTheme.electricCyan, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                'Accessed storage vault: $folderName',
                style: const TextStyle(
                  color: GolemTheme.textBright,
                  fontWeight: FontWeight.w600,
                  fontSize: 13,
                ),
              ),
            ),
          ],
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Drawer(
      child: Container(
        color: GolemTheme.surfaceBlack,
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // 1. Header with GOLEM Mascot Name & Glowing Faceted Geometric Logo
              _buildHeader(),

              const SizedBox(height: 12),
              // Tab Navigation: Vaults vs Synthesis History
              _buildTabBar(),
              const SizedBox(height: 12),
              const Divider(color: GolemTheme.obsidianAccent, height: 1),

              Expanded(
                child: _activeTabIndex == 0
                    ? _buildVaultsView()
                    : _buildSynthesisHistoryView(),
              ),

              // Footer System Diagnostics Status
              _buildFooter(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTabBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: ClipPath(
        clipper: const FacetedClipper(cutSize: 6),
        child: Container(
          padding: const EdgeInsets.all(3),
          decoration: BoxDecoration(
            color: GolemTheme.cardBlack,
            border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.3)),
          ),
          child: Row(
            children: [
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _activeTabIndex = 0),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    color: _activeTabIndex == 0 ? GolemTheme.electricCyan : Colors.transparent,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.memory_rounded,
                          size: 14,
                          color: _activeTabIndex == 0 ? Colors.black : GolemTheme.textMuted,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'VAULTS',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: _activeTabIndex == 0 ? Colors.black : GolemTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
              Expanded(
                child: InkWell(
                  onTap: () => setState(() => _activeTabIndex = 1),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    color: _activeTabIndex == 1 ? GolemTheme.electricCyan : Colors.transparent,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.history_rounded,
                          size: 14,
                          color: _activeTabIndex == 1 ? Colors.black : GolemTheme.textMuted,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'HISTORY (\${_synthesisHistory.length})',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w700,
                            letterSpacing: 1.2,
                            color: _activeTabIndex == 1 ? Colors.black : GolemTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildVaultsView() {
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      children: [
        // 2. Settings Section: Language Dropdown / Toggle
        _buildSectionHeader('SYSTEM LOCALIZATION', Icons.language_rounded),
        const SizedBox(height: 12),
        _buildLanguageSelector(),

        const SizedBox(height: 28),

        // 3. Memory / Storage Section
        _buildSectionHeader('NEURAL STORAGE VAULTS', Icons.memory_rounded),
        const SizedBox(height: 12),
        ..._storageFolders.map((folder) => _buildStorageTile(folder)),
      ],
    );
  }

  Widget _buildSynthesisHistoryView() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      itemCount: _synthesisHistory.length,
      itemBuilder: (context, index) {
        final item = _synthesisHistory[index];
        final isExpanded = _expandedHistoryId == item['id'];

        return Padding(
          padding: const EdgeInsets.only(bottom: 12),
          child: ClipPath(
            clipper: const FacetedClipper(cutSize: 8),
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: GolemTheme.cardBlack,
                border: Border.all(
                  color: isExpanded ? GolemTheme.electricCyan : GolemTheme.obsidianAccent,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.view_in_ar, size: 16, color: GolemTheme.electricCyan),
                          const SizedBox(width: 8),
                          Text(
                            item['name'] as String,
                            style: const TextStyle(
                              color: GolemTheme.textBright,
                              fontSize: 13,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ],
                      ),
                      Text(
                        item['timestamp'] as String,
                        style: const TextStyle(fontSize: 10, color: GolemTheme.textMuted),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // Telemetry metrics pills
                  Row(
                    children: [
                      _buildMetricBadge('SIZE', item['fileSize'] as String),
                      const SizedBox(width: 6),
                      _buildMetricBadge('POLYS', '\${item[\'polygons\']}'),
                      const SizedBox(width: 6),
                      _buildMetricBadge('DENSITY', (item['meshDensity'] as String).split(' ')[0]),
                    ],
                  ),

                  if (isExpanded) ...[
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(8),
                      color: Colors.black.withOpacity(0.6),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildDetailRow('Dimensions', item['dimensions'] as String),
                          _buildDetailRow('Vertices', '\${item[\'vertices\']}'),
                          _buildDetailRow('Compression', item['draco'] as String),
                          _buildDetailRow('Texture', item['texture'] as String),
                        ],
                      ),
                    ),
                  ],

                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.of(context).pop();
                            ScaffoldMessenger.of(context).showSnackBar(
                              SnackBar(
                                content: Text('Re-accessed model: \${item[\'name\']}'),
                                duration: const Duration(seconds: 2),
                              ),
                            );
                          },
                          icon: const Icon(Icons.open_in_new, size: 12, color: Colors.black),
                          label: const Text(
                            'RE-ACCESS',
                            style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: Colors.black),
                          ),
                          style: OutlinedButton.styleFrom(
                            backgroundColor: GolemTheme.electricCyan,
                            padding: const EdgeInsets.symmetric(vertical: 4),
                          ),
                        ),
                      ),
                      const SizedBox(width: 6),
                      IconButton(
                        onPressed: () {
                          setState(() {
                            _expandedHistoryId = isExpanded ? null : item['id'] as String;
                          });
                        },
                        icon: Icon(
                          isExpanded ? Icons.expand_less : Icons.expand_more,
                          size: 18,
                          color: GolemTheme.textBright,
                        ),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                      ),
                      const SizedBox(width: 4),
                      IconButton(
                        onPressed: () => _shareSynthesisLink(item),
                        icon: const Icon(Icons.share_rounded, size: 18, color: GolemTheme.hudSuccessGreen),
                        tooltip: 'Share Synthesis: Copy 3D telemetry link',
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                      ),
                      const SizedBox(width: 4),
                      IconButton(
                        onPressed: () => _copyHistoryModelJson(item),
                        icon: const Icon(Icons.code_rounded, size: 18, color: GolemTheme.electricCyan),
                        tooltip: 'Copy Flutter JSON telemetry',
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(minWidth: 32, minHeight: 32),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildMetricBadge(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.4),
          border: Border.all(color: GolemTheme.obsidianAccent.withOpacity(0.5)),
        ),
        child: Column(
          children: [
            Text(label, style: const TextStyle(fontSize: 8, color: GolemTheme.textMuted)),
            Text(
              value,
              style: const TextStyle(
                fontSize: 10,
                fontWeight: FontWeight.w700,
                color: GolemTheme.electricCyan,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 10, color: GolemTheme.textMuted)),
          Text(
            value,
            style: const TextStyle(fontSize: 10, color: GolemTheme.crystalBlue, fontWeight: FontWeight.w600),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 16),
      child: Column(
        children: [
          // Glowing Faceted Geometric Logo Placeholder
          Stack(
            alignment: Alignment.center,
            children: [
              // Outer glow container
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  boxShadow: [
                    BoxShadow(
                      color: GolemTheme.electricCyan.withOpacity(0.35),
                      blurRadius: 24,
                      spreadRadius: 2,
                    ),
                  ],
                ),
              ),
              // Faceted polygonal emblem
              ClipPath(
                clipper: const FacetedClipper(cutSize: 18),
                child: Container(
                  width: 74,
                  height: 74,
                  decoration: const BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        Color(0xFF00384D),
                        Color(0xFF08192E),
                        Color(0xFF030712),
                      ],
                    ),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Geometric wireframe diamond icon
                      CustomPaint(
                        size: const Size(40, 40),
                        painter: _GeometricStoneLogoPainter(),
                      ),
                      const Icon(
                        Icons.view_in_ar,
                        color: GolemTheme.electricCyan,
                        size: 28,
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),
          // Mascot Name
          const Text(
            'G O L E M',
            style: TextStyle(
              color: GolemTheme.electricCyan,
              fontSize: 24,
              fontWeight: FontWeight.w800,
              letterSpacing: 4.0,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'AUTONOMOUS 3D SYNTHESIS COMPANION',
            style: TextStyle(
              color: GolemTheme.textMuted.withOpacity(0.8),
              fontSize: 10,
              letterSpacing: 1.5,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: GolemTheme.crystalBlue),
        const SizedBox(width: 8),
        Text(
          title,
          style: const TextStyle(
            color: GolemTheme.crystalBlue,
            fontSize: 11,
            letterSpacing: 1.8,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }

  Widget _buildLanguageSelector() {
    return ClipPath(
      clipper: const FacetedClipper(cutSize: 8),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
        decoration: BoxDecoration(
          color: GolemTheme.cardBlack,
          border: Border.all(color: GolemTheme.stoneGuardianGrey.withOpacity(0.5)),
        ),
        child: DropdownButtonHideUnderline(
          child: DropdownButton<String>(
            value: _selectedLanguage,
            dropdownColor: GolemTheme.cardBlack,
            isExpanded: true,
            icon: const Icon(Icons.keyboard_arrow_down, color: GolemTheme.electricCyan),
            items: const [
              DropdownMenuItem(
                value: 'English',
                child: Text('English (US) // Primary', style: TextStyle(fontSize: 14)),
              ),
              DropdownMenuItem(
                value: 'Русский',
                child: Text('Русский // Квантовый', style: TextStyle(fontSize: 14)),
              ),
              DropdownMenuItem(
                value: 'Deutsch',
                child: Text('Deutsch // Matrix', style: TextStyle(fontSize: 14)),
              ),
            ],
            onChanged: (String? newValue) {
              if (newValue != null) {
                setState(() => _selectedLanguage = newValue);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Language updated: $newValue'),
                    duration: const Duration(seconds: 1),
                  ),
                );
              }
            },
          ),
        ),
      ),
    );
  }

  Widget _buildStorageTile(Map<String, dynamic> folder) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: ClipPath(
        clipper: const FacetedClipper(cutSize: 8),
        child: InkWell(
          onTap: () => _showFolderSnackBar(context, folder['title'] as String),
          splashColor: GolemTheme.electricCyan.withOpacity(0.15),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            decoration: BoxDecoration(
              color: GolemTheme.cardBlack,
              border: Border.all(color: GolemTheme.stoneGuardianGrey.withOpacity(0.4)),
            ),
            child: Row(
              children: [
                Icon(folder['icon'] as IconData, color: GolemTheme.electricCyan, size: 20),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        folder['title'] as String,
                        style: const TextStyle(
                          color: GolemTheme.textBright,
                          fontWeight: FontWeight.w600,
                          fontSize: 14,
                        ),
                      ),
                      Text(
                        folder['count'] as String,
                        style: const TextStyle(
                          color: GolemTheme.textMuted,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(Icons.chevron_right_rounded, color: GolemTheme.textMuted, size: 18),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFooter() {
    return Container(
      padding: const EdgeInsets.all(16),
      color: GolemTheme.backgroundBlack,
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: GolemTheme.hudSuccessGreen,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text(
                'NEURAL CORE ONLINE',
                style: TextStyle(fontSize: 11, color: GolemTheme.textMuted, letterSpacing: 1.0),
              ),
            ],
          ),
          const Text(
            'v2.4-LOCAL',
            style: TextStyle(fontSize: 11, color: GolemTheme.electricCyan),
          ),
        ],
      ),
    );
  }
}

class _GeometricStoneLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = GolemTheme.electricCyan.withOpacity(0.4)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final path = Path();
    path.moveTo(size.width / 2, 0);
    path.lineTo(size.width, size.height / 2);
    path.lineTo(size.width / 2, size.height);
    path.lineTo(0, size.height / 2);
    path.close();

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
`
  },
  {
    path: 'lib/widgets/chat_bubble.dart',
    name: 'chat_bubble.dart',
    category: 'widgets',
    description: 'Message bubbles for User vs GOLEM with subtle crystalline/geometric borders and timestamps',
    code: `import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../theme/golem_theme.dart';
import '../models/chat_message.dart';
import 'faceted_border.dart';
import 'model_viewer_placeholder.dart';

class ChatBubble extends StatelessWidget {
  final ChatMessage message;

  const ChatBubble({
    super.key,
    required this.message,
  });

  @override
  Widget build(BuildContext context) {
    final isGolem = message.isGolem;
    final timeString = DateFormat('HH:mm').format(message.timestamp);

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Row(
        mainAxisAlignment: isGolem ? MainAxisAlignment.start : MainAxisAlignment.end,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // GOLEM Avatar
          if (isGolem) ...[
            _buildAvatar(),
            const SizedBox(width: 10),
          ],

          // Bubble Content
          Flexible(
            child: Column(
              crossAxisAlignment: isGolem ? CrossAxisAlignment.start : CrossAxisAlignment.end,
              children: [
                // Sender label & time
                Padding(
                  padding: const EdgeInsets.only(left: 4, right: 4, bottom: 4),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        isGolem ? 'GOLEM // GUARDIAN' : 'OPERATOR',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          color: isGolem ? GolemTheme.electricCyan : GolemTheme.crystalBlue,
                          letterSpacing: 1.2,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        timeString,
                        style: const TextStyle(fontSize: 10, color: GolemTheme.textMuted),
                      ),
                    ],
                  ),
                ),

                // If user attached an image
                if (message.imageAttachmentPath != null) ...[
                  _buildAttachedImage(message.imageAttachmentPath!),
                  const SizedBox(height: 6),
                ],

                // 3D Model Rendering or Standard Text Bubble
                if (message.is3DModel)
                  ModelViewerPlaceholder(
                    modelName: message.modelName,
                    polyCount: message.polyCount,
                    renderTime: message.renderTime,
                    fileSize: message.fileSize,
                    textureComplexity: message.textureComplexity,
                    meshDensity: message.meshDensity,
                    dimensions: message.dimensions,
                    compression: message.compression,
                  )
                else
                  _buildTextBubble(isGolem),
              ],
            ),
          ),

          // User Avatar Spacer
          if (!isGolem) ...[
            const SizedBox(width: 10),
            _buildUserAvatar(),
          ],
        ],
      ),
    );
  }

  Widget _buildAvatar() {
    return ClipPath(
      clipper: const FacetedClipper(cutSize: 6),
      child: Container(
        width: 34,
        height: 34,
        color: GolemTheme.cardBlack,
        child: Container(
          decoration: BoxDecoration(
            border: Border.all(color: GolemTheme.electricCyan, width: 1.2),
          ),
          child: const Icon(
            Icons.view_in_ar,
            size: 18,
            color: GolemTheme.electricCyan,
          ),
        ),
      ),
    );
  }

  Widget _buildUserAvatar() {
    return ClipPath(
      clipper: const FacetedClipper(cutSize: 6),
      child: Container(
        width: 34,
        height: 34,
        color: GolemTheme.obsidianAccent,
        child: const Icon(
          Icons.person_rounded,
          size: 18,
          color: GolemTheme.crystalBlue,
        ),
      ),
    );
  }

  Widget _buildAttachedImage(String imagePath) {
    return ClipPath(
      clipper: const FacetedClipper(cutSize: 8),
      child: Container(
        constraints: const BoxConstraints(maxHeight: 180, maxWidth: 240),
        decoration: BoxDecoration(
          border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.6), width: 1),
        ),
        child: Image.file(
          File(imagePath),
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => Container(
            height: 120,
            color: GolemTheme.cardBlack,
            child: const Center(
              child: Icon(Icons.image_not_supported_rounded, color: GolemTheme.textMuted),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildTextBubble(bool isGolem) {
    return CustomPaint(
      painter: isGolem
          ? FacetedBorderPainter(
              borderColor: GolemTheme.electricCyan.withOpacity(0.6),
              borderWidth: 1.0,
              cutSize: 10.0,
            )
          : null,
      child: ClipPath(
        clipper: FacetedClipper(cutSize: isGolem ? 10 : 8),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          decoration: BoxDecoration(
            color: isGolem ? GolemTheme.surfaceBlack : GolemTheme.obsidianAccent,
            border: !isGolem
                ? Border.all(color: GolemTheme.stoneGuardianGrey.withOpacity(0.5))
                : null,
          ),
          child: Text(
            message.content,
            style: TextStyle(
              fontSize: 14.5,
              color: isGolem ? GolemTheme.textBright : Colors.white,
              height: 1.4,
            ),
          ),
        ),
      ),
    );
  }
}
`
  },
  {
    path: 'lib/widgets/model_viewer_placeholder.dart',
    name: 'model_viewer_placeholder.dart',
    category: 'widgets',
    description: 'Placeholder widget for model_viewer_plus styled with crystalline HUD container and 3D preview telemetry',
    code: `import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../theme/golem_theme.dart';
import 'faceted_border.dart';

/// 3D Viewer Placeholder widget
/// In production, integrate:
/// ModelViewer(
///   src: 'assets/models/golem_guardian.glb',
///   alt: 'A 3D model of Golem',
///   autoRotate: true,
///   cameraControls: true,
/// )
class ModelViewerPlaceholder extends StatefulWidget {
  final String modelName;
  final String polyCount;
  final String renderTime;
  final String fileSize;
  final String textureComplexity;
  final String meshDensity;
  final String dimensions;
  final String compression;

  const ModelViewerPlaceholder({
    super.key,
    required this.modelName,
    required this.polyCount,
    required this.renderTime,
    this.fileSize = '4.82 MB',
    this.textureComplexity = '4K PBR (Albedo, Normal, Roughness, AO)',
    this.meshDensity = '28.4 tris/cm²',
    this.dimensions = '1.85m × 1.20m × 2.40m',
    this.compression = 'Draco L7 (-64%)',
  });

  @override
  State<ModelViewerPlaceholder> createState() => _ModelViewerPlaceholderState();
}

class _ModelViewerPlaceholderState extends State<ModelViewerPlaceholder>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  bool _isExpanded = false;
  bool _isRotating = true;
  bool _wireframeMode = false;
  String _tessellationLOD = 'Adaptive High';

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 3),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 310,
      margin: const EdgeInsets.only(top: 4),
      child: CustomPaint(
        painter: FacetedBorderPainter(
          borderColor: GolemTheme.electricCyan,
          borderWidth: 1.5,
          cutSize: 14.0,
        ),
        child: ClipPath(
          clipper: const FacetedClipper(cutSize: 14),
          child: Container(
            color: GolemTheme.cardBlack,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // 3D Header Bar (Tap to toggle expanded telemetry)
                InkWell(
                  onTap: () => setState(() => _isExpanded = !_isExpanded),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    color: GolemTheme.surfaceBlack,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.token_rounded, color: GolemTheme.electricCyan, size: 16),
                            const SizedBox(width: 6),
                            Text(
                              widget.modelName.toUpperCase(),
                              style: const TextStyle(
                                color: GolemTheme.electricCyan,
                                fontSize: 11,
                                fontWeight: FontWeight.w700,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: GolemTheme.electricCyan.withOpacity(0.1),
                                border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.5)),
                              ),
                              child: const Text(
                                '3D GLB',
                                style: TextStyle(fontSize: 9, color: GolemTheme.electricCyan),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Icon(
                              _isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                              size: 16,
                              color: GolemTheme.electricCyan,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),

                // Main 3D Viewport Simulation / model_viewer_plus Container
                GestureDetector(
                  onTap: () => setState(() => _isExpanded = !_isExpanded),
                  child: Container(
                    height: 180,
                    decoration: const BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment.center,
                        radius: 0.8,
                        colors: [
                          Color(0xFF0D2538),
                          Color(0xFF07111A),
                          Color(0xFF030712),
                        ],
                      ),
                    ),
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Holographic grid circles
                        CustomPaint(
                          size: const Size(160, 160),
                          painter: _HoloGridPainter(),
                        ),

                        // Holographic Polygonal Guardian Mesh Silhouette
                        AnimatedBuilder(
                          animation: _pulseController,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: 0.95 + (_pulseController.value * 0.08),
                              child: Icon(
                                _wireframeMode ? Icons.grid_4x4_rounded : Icons.view_in_ar,
                                size: 72,
                                color: _wireframeMode ? GolemTheme.crystalBlue : GolemTheme.electricCyan,
                              ),
                            );
                          },
                        ),

                        // Watermark Tag required by prompt
                        Positioned(
                          bottom: 12,
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.black.withOpacity(0.7),
                              borderRadius: BorderRadius.circular(4),
                              border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.4)),
                            ),
                            child: const Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(Icons.touch_app, size: 12, color: GolemTheme.electricCyan),
                                SizedBox(width: 6),
                                Text(
                                  '3D Model Rendered Here',
                                  style: TextStyle(
                                    color: GolemTheme.textBright,
                                    fontSize: 11,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                // Tap to Expand Banner
                InkWell(
                  onTap: () => setState(() => _isExpanded = !_isExpanded),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: const Color(0xFF061424),
                      border: Border(
                        top: BorderSide(color: GolemTheme.electricCyan.withOpacity(0.3)),
                      ),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.bolt, color: GolemTheme.electricCyan, size: 14),
                            const SizedBox(width: 6),
                            Text(
                              _isExpanded ? 'COLLAPSE 3D METADATA' : 'TAP TO EXPAND 3D DETAILS',
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w700,
                                color: GolemTheme.electricCyan,
                                letterSpacing: 1.2,
                              ),
                            ),
                          ],
                        ),
                        Icon(
                          _isExpanded ? Icons.expand_less : Icons.expand_more,
                          color: GolemTheme.electricCyan,
                          size: 16,
                        ),
                      ],
                    ),
                  ),
                ),

                // Telemetry Data Bar
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  color: GolemTheme.surfaceBlack,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'POLYS: \${widget.polyCount}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: GolemTheme.textMuted,
                          fontFamily: 'monospace',
                        ),
                      ),
                      Text(
                        'LATENCY: \${widget.renderTime}',
                        style: const TextStyle(
                          fontSize: 10,
                          color: GolemTheme.electricCyan,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                ),

                // EXPANDABLE DETAIL PANEL
                AnimatedSize(
                  duration: const Duration(milliseconds: 250),
                  curve: Curves.easeInOut,
                  child: _isExpanded
                      ? Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: GolemTheme.backgroundBlack,
                            border: Border(
                              top: BorderSide(color: GolemTheme.electricCyan.withOpacity(0.5), width: 1.5),
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // 0. Interactive 3D Mesh Rotation Control
                              _buildSectionTitle('INTERACTIVE MESH ROTATION', Icons.rotate_right_rounded),
                              const SizedBox(height: 6),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: GolemTheme.surfaceBlack,
                                  border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.4)),
                                ),
                                child: Column(
                                  children: [
                                    SizedBox(
                                      width: double.infinity,
                                      child: ElevatedButton.icon(
                                        style: ElevatedButton.styleFrom(
                                          backgroundColor: _isRotating
                                              ? GolemTheme.electricCyan.withOpacity(0.18)
                                              : Colors.black,
                                          side: BorderSide(
                                            color: _isRotating ? GolemTheme.electricCyan : Colors.white24,
                                          ),
                                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 10),
                                        ),
                                        onPressed: () => setState(() => _isRotating = !_isRotating),
                                        icon: Icon(
                                          _isRotating ? Icons.pause_circle_outline : Icons.rotate_right,
                                          color: _isRotating ? GolemTheme.electricCyan : GolemTheme.textMuted,
                                          size: 16,
                                        ),
                                        label: Row(
                                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                          children: [
                                            Text(
                                              'ROTATE 3D',
                                              style: TextStyle(
                                                fontSize: 11,
                                                fontWeight: FontWeight.bold,
                                                color: _isRotating ? GolemTheme.electricCyan : GolemTheme.textBright,
                                              ),
                                            ),
                                            Text(
                                              _isRotating ? 'ACTIVE' : 'PAUSED',
                                              style: TextStyle(
                                                fontSize: 9,
                                                fontWeight: FontWeight.bold,
                                                color: _isRotating ? GolemTheme.hudSuccessGreen : GolemTheme.textMuted,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 12),

                              // 1. File Size & Storage Footprint
                              _buildSectionTitle('FILE SIZE & FOOTPRINT', Icons.storage_rounded),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: GolemTheme.surfaceBlack,
                                  border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.3)),
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('GLB Binary Payload:', style: TextStyle(fontSize: 11, color: GolemTheme.textMuted)),
                                        Text(widget.fileSize, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: GolemTheme.electricCyan)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Draco Compression:', style: TextStyle(fontSize: 10, color: GolemTheme.textMuted)),
                                        Text(widget.compression, style: const TextStyle(fontSize: 10, color: GolemTheme.hudSuccessGreen)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    const Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('Geometry / Textures:', style: TextStyle(fontSize: 10, color: GolemTheme.textMuted)),
                                        Text('2.1 MB / 2.7 MB', style: TextStyle(fontSize: 10, color: GolemTheme.crystalBlue)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 12),

                              // 2. Texture Complexity
                              _buildSectionTitle('TEXTURE COMPLEXITY', Icons.layers_rounded),
                              const SizedBox(height: 6),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: GolemTheme.surfaceBlack,
                                  border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.3)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('Resolution:', style: TextStyle(fontSize: 11, color: GolemTheme.textMuted)),
                                        Text('4096 × 4096 (4K Ultra)', style: TextStyle(fontSize: 11, color: GolemTheme.crystalBlue, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(widget.textureComplexity, style: const TextStyle(fontSize: 10.5, color: GolemTheme.textBright)),
                                    const SizedBox(height: 6),
                                    Wrap(
                                      spacing: 4,
                                      runSpacing: 4,
                                      children: [
                                        _buildPill('Albedo RGB'),
                                        _buildPill('Normal Tangent'),
                                        _buildPill('Roughness'),
                                        _buildPill('Metallic'),
                                        _buildPill('Ambient Occlusion'),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 12),

                              // 3. Mesh Wireframe Density
                              _buildSectionTitle('MESH WIREFRAME DENSITY', Icons.grid_3x3_rounded),
                              const SizedBox(height: 6),
                              Container(
                                width: double.infinity,
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: GolemTheme.surfaceBlack,
                                  border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.3)),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Density Metric:', style: TextStyle(fontSize: 11, color: GolemTheme.textMuted)),
                                        Text(widget.meshDensity, style: const TextStyle(fontSize: 11, color: GolemTheme.hudSuccessGreen, fontWeight: FontWeight.bold)),
                                      ],
                                    ),
                                    const SizedBox(height: 6),
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Tessellation LOD:', style: TextStyle(fontSize: 10, color: GolemTheme.textMuted)),
                                        Row(
                                          children: ['Standard', 'Adaptive High'].map((lod) {
                                            final isSelected = _tessellationLOD == lod;
                                            return InkWell(
                                              onTap: () => setState(() => _tessellationLOD = lod),
                                              child: Container(
                                                margin: const EdgeInsets.only(left: 4),
                                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                                decoration: BoxDecoration(
                                                  color: isSelected ? GolemTheme.electricCyan : GolemTheme.cardBlack,
                                                  border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.5)),
                                                ),
                                                child: Text(
                                                  lod,
                                                  style: TextStyle(
                                                    fontSize: 9,
                                                    color: isSelected ? Colors.black : GolemTheme.textBright,
                                                    fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                                                  ),
                                                ),
                                              ),
                                            );
                                          }).toList(),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 8),
                                    // Toggle wireframe button
                                    SizedBox(
                                      width: double.infinity,
                                      child: OutlinedButton.icon(
                                        style: OutlinedButton.styleFrom(
                                          side: const BorderSide(color: GolemTheme.electricCyan),
                                          backgroundColor: _wireframeMode ? GolemTheme.electricCyan.withOpacity(0.2) : Colors.transparent,
                                          padding: const EdgeInsets.symmetric(vertical: 4),
                                        ),
                                        onPressed: () => setState(() => _wireframeMode = !_wireframeMode),
                                        icon: Icon(_wireframeMode ? Icons.visibility_off : Icons.visibility, size: 14, color: GolemTheme.electricCyan),
                                        label: Text(
                                          _wireframeMode ? 'HIDE WIREFRAME' : 'INSPECT WIREFRAME OVERLAY',
                                          style: const TextStyle(fontSize: 10, color: GolemTheme.electricCyan, fontWeight: FontWeight.bold),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 12),

                              // 4. Spatial Topology
                              _buildSectionTitle('SPATIAL BLUEPRINT & UV', Icons.view_in_ar_rounded),
                              const SizedBox(height: 6),
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(
                                  color: GolemTheme.surfaceBlack,
                                  border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.3)),
                                ),
                                child: Column(
                                  children: [
                                    Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        const Text('Dimensions:', style: TextStyle(fontSize: 10, color: GolemTheme.textMuted)),
                                        Text(widget.dimensions, style: const TextStyle(fontSize: 10, color: GolemTheme.textBright)),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    const Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        Text('UV Channels / Draw Calls:', style: TextStyle(fontSize: 10, color: GolemTheme.textMuted)),
                                        Text('2 Channels / 1 Batch Call', style: TextStyle(fontSize: 10, color: GolemTheme.textBright)),
                                      ],
                                    ),
                                  ],
                                ),
                              ),

                              const SizedBox(height: 12),

                              // 5. Actions: Export to Flutter JSON & Specs
                              SizedBox(
                                width: double.infinity,
                                child: ElevatedButton.icon(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: GolemTheme.electricCyan,
                                    foregroundColor: Colors.black,
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
                                  ),
                                  onPressed: () {
                                    final jsonMap = {
                                      'modelName': widget.modelName,
                                      'fileSize': widget.fileSize,
                                      'polyCount': widget.polyCount,
                                      'renderTime': widget.renderTime,
                                      'textureComplexity': widget.textureComplexity,
                                      'meshDensity': widget.meshDensity,
                                      'dimensions': widget.dimensions,
                                      'compression': widget.compression,
                                      'assetPath': 'assets/models/\${widget.modelName.toLowerCase().replaceAll(' ', '_')}.glb',
                                    };
                                    final jsonString = const JsonEncoder.withIndent('  ').convert(jsonMap);
                                    Clipboard.setData(ClipboardData(text: jsonString));
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                        content: Text('Copied \${widget.modelName} JSON telemetry!'),
                                        backgroundColor: GolemTheme.cardBlack,
                                        behavior: SnackBarBehavior.floating,
                                      ),
                                    );
                                  },
                                  icon: const Icon(Icons.code, size: 16),
                                  label: const Text(
                                    'EXPORT TO FLUTTER (COPY JSON)',
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, letterSpacing: 0.8),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      : const SizedBox.shrink(),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 14, color: GolemTheme.electricCyan),
        const SizedBox(width: 6),
        Text(
          title,
          style: const TextStyle(
            fontSize: 10,
            fontWeight: FontWeight.w700,
            color: GolemTheme.electricCyan,
            letterSpacing: 1.2,
          ),
        ),
      ],
    );
  }

  Widget _buildPill(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
      decoration: BoxDecoration(
        color: GolemTheme.cardBlack,
        border: Border.all(color: GolemTheme.crystalBlue.withOpacity(0.4)),
      ),
      child: Text(
        text,
        style: const TextStyle(fontSize: 8.5, color: GolemTheme.crystalBlue),
      ),
    );
  }
}

class _HoloGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = GolemTheme.electricCyan.withOpacity(0.18)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    canvas.drawCircle(Offset(size.width / 2, size.height / 2), 40, paint);
    canvas.drawCircle(Offset(size.width / 2, size.height / 2), 70, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
`
  },
  {
    path: 'lib/widgets/synthesis_progress_bar.dart',
    name: 'synthesis_progress_bar.dart',
    category: 'widgets',
    description: 'Real-time dual-stage progress bar component visualizing ingestion and mesh synthesis with cyan-to-emerald gradient',
    code: `import 'package:flutter/material.dart';
import '../theme/golem_theme.dart';
import 'faceted_clipper.dart';

enum SynthesisStage {
  ingestion,
  meshSynthesis,
  complete,
}

class SynthesisProgressBar extends StatelessWidget {
  final double progress; // 0.0 to 100.0
  final SynthesisStage stage;
  final String statusText;
  final String? subDetail;
  final int tflops;
  final int vertices;
  final int polygons;
  final String? promptSnippet;

  const SynthesisProgressBar({
    super.key,
    required this.progress,
    required this.stage,
    required this.statusText,
    this.subDetail,
    this.tflops = 124,
    this.vertices = 9840,
    this.polygons = 18940,
    this.promptSnippet,
  });

  @override
  Widget build(BuildContext context) {
    final clampedProgress = progress.clamp(0.0, 100.0);
    final isIngestion = clampedProgress < 50.0;
    final isSynthesis = clampedProgress >= 50.0 && clampedProgress < 100.0;
    final isComplete = clampedProgress >= 100.0;

    return Container(
      margin: const EdgeInsets.symmetric(vertical: 6),
      decoration: BoxDecoration(
        color: GolemTheme.cardBlack.withOpacity(0.95),
        border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.5)),
        boxShadow: [
          BoxShadow(
            color: GolemTheme.electricCyan.withOpacity(0.12),
            blurRadius: 16,
            spreadRadius: 1,
          ),
        ],
      ),
      child: ClipPath(
        clipper: const FacetedClipper(cutSize: 8),
        child: Padding(
          padding: const EdgeInsets.all(12.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header: Stage Title & Percent
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Icon(
                        isComplete
                            ? Icons.check_circle_rounded
                            : Icons.cached_rounded,
                        size: 16,
                        color: isComplete
                            ? GolemTheme.neonGreen
                            : GolemTheme.electricCyan,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        isComplete
                            ? 'SYNTHESIS COMPLETE'
                            : isIngestion
                                ? 'STAGE 1/2: INGESTION'
                                : 'STAGE 2/2: MESH SYNTHESIS',
                        style: TextStyle(
                          color: isComplete
                              ? GolemTheme.neonGreen
                              : GolemTheme.electricCyan,
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: isComplete
                          ? GolemTheme.neonGreen.withOpacity(0.15)
                          : Colors.black,
                      border: Border.all(
                        color: isComplete
                            ? GolemTheme.neonGreen
                            : GolemTheme.electricCyan.withOpacity(0.4),
                      ),
                    ),
                    child: Text(
                      '\${clampedProgress.toInt()}%',
                      style: TextStyle(
                        fontFamily: 'JetBrains Mono',
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: isComplete
                            ? GolemTheme.neonGreen
                            : GolemTheme.electricCyan,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Dual-Stage Stepper Pills
              Row(
                children: [
                  Expanded(
                    child: _buildStagePill(
                      title: '1. INGESTION',
                      isActive: isIngestion,
                      isDone: !isIngestion || isComplete,
                      activeColor: GolemTheme.electricCyan,
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: _buildStagePill(
                      title: '2. MESH SYNTH',
                      isActive: isSynthesis,
                      isDone: isComplete,
                      activeColor: GolemTheme.neonGreen,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 10),

              // Progress Bar Track: Cyan-to-Emerald Gradient Fill
              Container(
                height: 10,
                width: double.infinity,
                decoration: BoxDecoration(
                  color: const Color(0xFF030A14),
                  border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.3)),
                ),
                child: Stack(
                  children: [
                    // Midpoint 50% Divider
                    Positioned(
                      left: 0,
                      right: 0,
                      top: 0,
                      bottom: 0,
                      child: Center(
                        child: Container(
                          width: 1,
                          color: GolemTheme.electricCyan.withOpacity(0.4),
                        ),
                      ),
                    ),
                    // Gradient Fill Bar
                    FractionallySizedBox(
                      widthFactor: clampedProgress / 100.0,
                      child: Container(
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              GolemTheme.electricCyan,
                              Color(0xFF2DD4BF),
                              GolemTheme.neonGreen,
                            ],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: GolemTheme.electricCyan,
                              blurRadius: 8,
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 8),

              // Status Text & Telemetry
              Text(
                statusText,
                style: const TextStyle(
                  fontSize: 11,
                  color: GolemTheme.textBright,
                  fontFamily: 'JetBrains Mono',
                ),
              ),
              if (subDetail != null) ...[
                const SizedBox(height: 3),
                Text(
                  subDetail!,
                  style: const TextStyle(
                    fontSize: 9.5,
                    color: GolemTheme.textMuted,
                    fontFamily: 'JetBrains Mono',
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStagePill({
    required String title,
    required bool isActive,
    required bool isDone,
    required Color activeColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isActive
            ? activeColor.withOpacity(0.15)
            : isDone
                ? GolemTheme.cardBlack
                : const Color(0xFF040912),
        border: Border.all(
          color: isActive
              ? activeColor
              : isDone
                  ? activeColor.withOpacity(0.4)
                  : Colors.white10,
        ),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 9.5,
              fontWeight: FontWeight.bold,
              color: isActive || isDone ? GolemTheme.textBright : GolemTheme.textMuted,
            ),
          ),
          Icon(
            isDone
                ? Icons.check
                : isActive
                    ? Icons.circle
                    : Icons.schedule,
            size: 10,
            color: isActive ? activeColor : isDone ? GolemTheme.neonGreen : GolemTheme.textMuted,
          ),
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'lib/widgets/action_bottom_sheet.dart',
    name: 'action_bottom_sheet.dart',
    category: 'widgets',
    description: 'Sleek cyberpunk bottom sheet with 3 action icons: Add Photo, Add File, Open Camera',
    code: `import 'package:flutter/material.dart';
import '../theme/golem_theme.dart';
import 'faceted_border.dart';

enum AttachmentAction {
  addPhoto,
  addFile,
  openCamera,
}

class ActionBottomSheet extends StatelessWidget {
  final ValueChanged<AttachmentAction> onActionSelected;

  const ActionBottomSheet({
    super.key,
    required this.onActionSelected,
  });

  static Future<AttachmentAction?> show(BuildContext context) {
    return showModalBottomSheet<AttachmentAction>(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (ctx) => ActionBottomSheet(
        onActionSelected: (action) => Navigator.pop(ctx, action),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 8, 16, 28),
      child: CustomPaint(
        painter: FacetedBorderPainter(
          borderColor: GolemTheme.electricCyan,
          borderWidth: 1.5,
          cutSize: 16.0,
        ),
        child: ClipPath(
          clipper: const FacetedClipper(cutSize: 16),
          child: Container(
            color: GolemTheme.surfaceBlack,
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Drag handle bar
                Container(
                  width: 36,
                  height: 3,
                  decoration: BoxDecoration(
                    color: GolemTheme.stoneGuardianGrey,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
                const SizedBox(height: 16),

                // Title
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.hub_rounded, size: 16, color: GolemTheme.electricCyan),
                    const SizedBox(width: 8),
                    Text(
                      'INPUT PERIPHERALS // INGEST MATRIX',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w700,
                        color: GolemTheme.electricCyan.withOpacity(0.9),
                        letterSpacing: 2.0,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),

                // 3 Action Buttons
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    _buildActionButton(
                      context,
                      label: 'Add Photo',
                      subtext: 'Gallery / JPG',
                      icon: Icons.photo_library_outlined,
                      action: AttachmentAction.addPhoto,
                    ),
                    _buildActionButton(
                      context,
                      label: 'Add File',
                      subtext: 'OBJ / CAD / DOC',
                      icon: Icons.attach_file_rounded,
                      action: AttachmentAction.addFile,
                    ),
                    _buildActionButton(
                      context,
                      label: 'Open Camera',
                      subtext: 'HUD Vision Scanner',
                      icon: Icons.camera_alt_outlined,
                      action: AttachmentAction.openCamera,
                      isHighlighted: true,
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildActionButton(
    BuildContext context, {
    required String label,
    required String subtext,
    required IconData icon,
    required AttachmentAction action,
    bool isHighlighted = false,
  }) {
    return InkWell(
      onTap: () => onActionSelected(action),
      child: Column(
        children: [
          ClipPath(
            clipper: const FacetedClipper(cutSize: 10),
            child: Container(
              width: 72,
              height: 72,
              decoration: BoxDecoration(
                color: isHighlighted
                    ? GolemTheme.electricCyan.withOpacity(0.15)
                    : GolemTheme.cardBlack,
                border: Border.all(
                  color: isHighlighted
                      ? GolemTheme.electricCyan
                      : GolemTheme.stoneGuardianGrey.withOpacity(0.6),
                  width: isHighlighted ? 1.5 : 1.0,
                ),
              ),
              child: Icon(
                icon,
                size: 30,
                color: isHighlighted ? GolemTheme.electricCyan : GolemTheme.textBright,
              ),
            ),
          ),
          const SizedBox(height: 10),
          Text(
            label,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: isHighlighted ? GolemTheme.electricCyan : GolemTheme.textBright,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtext,
            style: const TextStyle(
              fontSize: 10,
              color: GolemTheme.textMuted,
            ),
          ),
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'lib/widgets/camera_hud_overlay.dart',
    name: 'camera_hud_overlay.dart',
    category: 'widgets',
    description: 'Custom HUD overlay with crosshairs, scanlines, telemetry reticles, and framing brackets',
    code: `import 'package:flutter/material.dart';
import '../theme/golem_theme.dart';

class CameraHudOverlay extends StatefulWidget {
  const CameraHudOverlay({super.key});

  @override
  State<CameraHudOverlay> createState() => _CameraHudOverlayState();
}

class _CameraHudOverlayState extends State<CameraHudOverlay>
    with SingleTickerProviderStateMixin {
  late AnimationController _scanlineController;

  @override
  void initState() {
    super.initState();
    _scanlineController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();
  }

  @override
  void dispose() {
    _scanlineController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: Stack(
        fit: StackFit.expand,
        children: [
          // Animated Scanning Beam
          AnimatedBuilder(
            animation: _scanlineController,
            builder: (context, child) {
              return CustomPaint(
                painter: _ScanlineBeamPainter(_scanlineController.value),
              );
            },
          ),

          // Central Reticle & Crosshairs
          Center(
            child: CustomPaint(
              size: const Size(220, 220),
              painter: _CrosshairsHudPainter(),
            ),
          ),

          // HUD Corner Framing Brackets
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 80),
            child: CustomPaint(
              painter: _CornerBracketsPainter(),
            ),
          ),

          // Top Telemetry Metrics
          Positioned(
            top: 56,
            left: 24,
            right: 24,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Row(
                  children: [
                    Icon(Icons.radar, color: GolemTheme.electricCyan, size: 16),
                    SizedBox(width: 8),
                    Text(
                      '3D SPATIAL SENSOR ACTIVE',
                      style: TextStyle(
                        fontFamily: 'monospace',
                        color: GolemTheme.electricCyan,
                        fontSize: 11,
                        letterSpacing: 1.5,
                      ),
                    ),
                  ],
                ),
                Text(
                  'FOV: 84° // 60 FPS',
                  style: TextStyle(
                    fontFamily: 'monospace',
                    color: GolemTheme.electricCyan.withOpacity(0.8),
                    fontSize: 11,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CrosshairsHudPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final cyanPaint = Paint()
      ..color = GolemTheme.electricCyan.withOpacity(0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.2;

    final faintPaint = Paint()
      ..color = GolemTheme.electricCyan.withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    final center = Offset(size.width / 2, size.height / 2);

    // Inner & Outer Targeting Circles
    canvas.drawCircle(center, 30, cyanPaint);
    canvas.drawCircle(center, 80, faintPaint);

    // Center Crosshair lines
    const lineLen = 14.0;
    const gap = 12.0;

    // Left
    canvas.drawLine(Offset(center.dx - gap - lineLen, center.dy), Offset(center.dx - gap, center.dy), cyanPaint);
    // Right
    canvas.drawLine(Offset(center.dx + gap, center.dy), Offset(center.dx + gap + lineLen, center.dy), cyanPaint);
    // Top
    canvas.drawLine(Offset(center.dx, center.dy - gap - lineLen), Offset(center.dx, center.dy - gap), cyanPaint);
    // Bottom
    canvas.drawLine(Offset(center.dx, center.dy + gap), Offset(center.dx, center.dy + gap + lineLen), cyanPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _CornerBracketsPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = GolemTheme.electricCyan.withOpacity(0.6)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.0;

    const arm = 24.0;

    // Top-Left Bracket
    canvas.drawLine(const Offset(0, 0), const Offset(arm, 0), paint);
    canvas.drawLine(const Offset(0, 0), const Offset(0, arm), paint);

    // Top-Right Bracket
    canvas.drawLine(Offset(size.width, 0), Offset(size.width - arm, 0), paint);
    canvas.drawLine(Offset(size.width, 0), Offset(size.width, arm), paint);

    // Bottom-Left Bracket
    canvas.drawLine(Offset(0, size.height), Offset(arm, size.height), paint);
    canvas.drawLine(Offset(0, size.height), Offset(0, size.height - arm), paint);

    // Bottom-Right Bracket
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width - arm, size.height), paint);
    canvas.drawLine(Offset(size.width, size.height), Offset(size.width, size.height - arm), paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ScanlineBeamPainter extends CustomPainter {
  final double progress;

  _ScanlineBeamPainter(this.progress);

  @override
  void paint(Canvas canvas, Size size) {
    final y = size.height * progress;
    final linePaint = Paint()
      ..color = GolemTheme.electricCyan.withOpacity(0.3)
      ..strokeWidth = 2.0;

    canvas.drawLine(Offset(0, y), Offset(size.width, y), linePaint);
  }

  @override
  bool shouldRepaint(covariant _ScanlineBeamPainter oldDelegate) =>
      oldDelegate.progress != progress;
}
`
  },
  {
    path: 'lib/screens/camera_screen.dart',
    name: 'camera_screen.dart',
    category: 'screens',
    description: 'In-app full-screen camera view using camera package with custom HUD overlay and photo capture callback',
    code: `import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import '../theme/golem_theme.dart';
import '../widgets/camera_hud_overlay.dart';
import '../widgets/faceted_border.dart';

class CameraScreen extends StatefulWidget {
  final List<CameraDescription> cameras;

  const CameraScreen({
    super.key,
    required this.cameras,
  });

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  bool _isCameraInitialized = false;
  bool _isCapturing = false;

  @override
  void initState() {
    super.initState();
    _initializeCamera();
  }

  Future<void> _initializeCamera() async {
    if (widget.cameras.isEmpty) {
      debugPrint('GOLEM Camera: No physical camera detected, running in HUD simulation mode.');
      return;
    }

    _controller = CameraController(
      widget.cameras.first,
      ResolutionPreset.high,
      enableAudio: false,
    );

    try {
      await _controller!.initialize();
      if (!mounted) return;
      setState(() => _isCameraInitialized = true);
    } catch (e) {
      debugPrint('Camera initialization error: $e');
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _capturePhoto() async {
    if (_isCapturing) return;

    setState(() => _isCapturing = true);

    try {
      String? capturedPath;

      if (_controller != null && _controller!.value.isInitialized) {
        final XFile photo = await _controller!.takePicture();
        capturedPath = photo.path;
      } else {
        // Mock capture path when testing on simulator/desktop
        capturedPath = 'mock_golem_scan_\${DateTime.now().millisecondsSinceEpoch}.jpg';
      }

      if (!mounted) return;
      // Return captured path to ChatScreen to display thumbnail
      Navigator.pop(context, capturedPath);
    } catch (e) {
      debugPrint('Capture error: $e');
      if (mounted) setState(() => _isCapturing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        fit: StackFit.expand,
        children: [
          // 1. Camera Viewfinder or Simulated Camera Sensor
          if (_isCameraInitialized && _controller != null)
            CameraPreview(_controller!)
          else
            _buildSimulatedSensorFeed(),

          // 2. Custom Futuristic Cyberpunk HUD Overlay (Crosshairs & Scanlines)
          const CameraHudOverlay(),

          // 3. Close Button (Top Left)
          Positioned(
            top: 44,
            left: 16,
            child: ClipPath(
              clipper: const FacetedClipper(cutSize: 8),
              child: Container(
                color: GolemTheme.surfaceBlack.withOpacity(0.85),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: GolemTheme.electricCyan),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
            ),
          ),

          // 4. Bottom Controls: Shutter Button
          Positioned(
            bottom: 36,
            left: 0,
            right: 0,
            child: Center(
              child: _buildCaptureButton(),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSimulatedSensorFeed() {
    return Container(
      decoration: const BoxDecoration(
        gradient: RadialGradient(
          center: Alignment.center,
          radius: 1.0,
          colors: [
            Color(0xFF0F1E2E),
            Color(0xFF060B14),
            Color(0xFF000000),
          ],
        ),
      ),
      child: const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.camera_enhance_rounded,
              color: GolemTheme.electricCyan,
              size: 48,
            ),
            SizedBox(height: 12),
            Text(
              'OPTICAL SENSOR FEED: READY',
              style: TextStyle(
                color: GolemTheme.electricCyan,
                fontFamily: 'monospace',
                fontSize: 12,
                letterSpacing: 2.0,
              ),
            ),
            SizedBox(height: 4),
            Text(
              'ALIGN TARGET FOR 3D TOPOLOGY EXTRACTION',
              style: TextStyle(
                color: GolemTheme.textMuted,
                fontSize: 11,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCaptureButton() {
    return GestureDetector(
      onTap: _capturePhoto,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Outer glowing ring
          Container(
            width: 82,
            height: 82,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: GolemTheme.electricCyan.withOpacity(0.4),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),
          // Outer faceted ring
          CustomPaint(
            size: const Size(78, 78),
            painter: FacetedBorderPainter(
              borderColor: GolemTheme.electricCyan,
              borderWidth: 2.0,
              cutSize: 16.0,
            ),
          ),
          // Inner Shutter Button
          ClipPath(
            clipper: const FacetedClipper(cutSize: 12),
            child: Container(
              width: 58,
              height: 58,
              color: _isCapturing ? GolemTheme.hudAmber : GolemTheme.electricCyan,
              child: const Icon(
                Icons.camera_alt,
                color: GolemTheme.backgroundBlack,
                size: 28,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
`
  },
  {
    path: 'lib/screens/chat_screen.dart',
    name: 'chat_screen.dart',
    category: 'screens',
    description: 'Main screen with Scaffold, Left-side Drawer, ListView chat bubbles, and Bottom Input bar with + button',
    code: `import 'dart:io';
import 'package:flutter/material.dart';
import '../theme/golem_theme.dart';
import '../models/chat_message.dart';
import '../widgets/golem_drawer.dart';
import '../widgets/chat_bubble.dart';
import '../widgets/action_bottom_sheet.dart';
import '../widgets/faceted_border.dart';
import 'camera_screen.dart';
import '../main.dart'; // contains availableCamerasList

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  final TextEditingController _promptController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();

  String? _attachedThumbnailPath;

  // Initial Mock messages demonstrating conversation & 3D model return
  final List<ChatMessage> _messages = [
    ChatMessage(
      id: '1',
      sender: SenderType.golem,
      content: 'Core initialized. I am GOLEM, your holographic stone guardian companion. Input your prompt to synthesize 3D spatial models.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 5)),
    ),
    ChatMessage(
      id: '2',
      sender: SenderType.user,
      content: 'Synthesize an ancient runic monolith guardian with crystalline obsidian veins.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 3)),
    ),
    // 3D Model return bubble requirement
    ChatMessage(
      id: '3',
      sender: SenderType.golem,
      content: 'Spatial mesh synthesized. Quantum lattice rendered 12,480 polygonal facets with deep obsidian shader. Tap the model card to inspect file size, texture complexity, and wireframe density.',
      timestamp: DateTime.now().subtract(const Duration(minutes: 2)),
      type: MessageType.model3D,
      modelMetadata: {
        'name': 'Runic Stone Guardian',
        'polys': '12,480 Tris',
        'time': '1.2s local',
        'fileSize': '4.82 MB',
        'textureComplexity': '4K PBR (Albedo, Normal, Roughness, AO)',
        'meshDensity': '28.4 tris/cm²',
        'dimensions': '1.85m × 1.20m × 2.40m',
        'compression': 'Draco L7 (-64%)',
      },
    ),
  ];

  void _sendMessage() {
    final text = _promptController.text.trim();
    if (text.isEmpty && _attachedThumbnailPath == null) return;

    final userMessage = ChatMessage(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      sender: SenderType.user,
      content: text.isEmpty ? 'Transmitted spatial visual data.' : text,
      timestamp: DateTime.now(),
      imageAttachmentPath: _attachedThumbnailPath,
    );

    setState(() {
      _messages.add(userMessage);
      _promptController.clear();
      _attachedThumbnailPath = null;
    });

    _scrollToBottom();

    // Trigger Mock GOLEM response with synthesized 3D model
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (!mounted) return;
      final golemReply = ChatMessage(
        id: (DateTime.now().millisecondsSinceEpoch + 1).toString(),
        sender: SenderType.golem,
        content: 'Analyzing geometry topology: "$text". Spatial lattice materialized with 18,940 facets and 4K multi-layer PBR textures.',
        timestamp: DateTime.now(),
        type: MessageType.model3D,
        modelMetadata: {
          'name': text.length > 20 ? '\${text.substring(0, 18)}...' : text,
          'polys': '18,940 Tris',
          'time': '1.4s local',
          'fileSize': '6.15 MB',
          'textureComplexity': '4K Ultra-PBR (Albedo, Normal, Roughness, Metalness, AO)',
          'meshDensity': '31.2 tris/cm²',
          'dimensions': '2.10m × 1.45m × 2.80m',
          'compression': 'Draco L7 (-68%)',
        },
      );
      setState(() => _messages.add(golemReply));
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent + 80,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  // '+' Button Action: Opens sleek BottomSheet
  Future<void> _handlePlusAction() async {
    final action = await ActionBottomSheet.show(context);
    if (action == null) return;

    switch (action) {
      case AttachmentAction.addPhoto:
        _mockPickPhoto();
        break;
      case AttachmentAction.addFile:
        _mockPickFile();
        break;
      case AttachmentAction.openCamera:
        _openCameraScreen();
        break;
    }
  }

  void _mockPickPhoto() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Mock Photo selected from device gallery.')),
    );
    setState(() {
      _attachedThumbnailPath = 'mock_gallery_photo.jpg';
    });
  }

  void _mockPickFile() {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Mock 3D CAD/OBJ file selected.')),
    );
  }

  // Transition to In-App Camera View
  Future<void> _openCameraScreen() async {
    final capturedPath = await Navigator.push<String>(
      context,
      MaterialPageRoute(
        builder: (_) => CameraScreen(cameras: availableCamerasList),
      ),
    );

    if (capturedPath != null && mounted) {
      setState(() {
        _attachedThumbnailPath = capturedPath;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('HUD Optical scan captured & attached to input bar.'),
          duration: Duration(seconds: 2),
        ),
      );
    }
  }

  @override
  void dispose() {
    _promptController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: GolemTheme.backgroundBlack,
      
      // 1. App Bar with Left Drawer Hamburger & Crystalline Status
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.menu_rounded, color: GolemTheme.electricCyan),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipPath(
              clipper: const FacetedClipper(cutSize: 4),
              child: Container(
                width: 12,
                height: 12,
                color: GolemTheme.electricCyan,
              ),
            ),
            const SizedBox(width: 8),
            const Text('GOLEM'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.graphic_eq_rounded, color: GolemTheme.crystalBlue),
            tooltip: 'Holo Audio Diagnostic',
            onPressed: () {},
          ),
        ],
      ),

      // 2. Left-side Drawer
      drawer: const GolemDrawer(),

      // 3. Main Chat Interface
      body: SafeArea(
        child: Column(
          children: [
            // Status bar sub-header with dynamic VRAM / Compute Load Gauge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              color: GolemTheme.surfaceBlack.withOpacity(0.9),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  const Row(
                    children: [
                      Icon(Icons.circle, size: 8, color: GolemTheme.hudSuccessGreen),
                      SizedBox(width: 6),
                      Text(
                        'STATUS: SYNCHRONIZED',
                        style: TextStyle(
                          fontSize: 10,
                          color: GolemTheme.hudSuccessGreen,
                          letterSpacing: 1.2,
                          fontWeight: FontWeight.w700,
                          fontFamily: 'monospace',
                        ),
                      ),
                    ],
                  ),
                  // Dynamic VRAM / Compute Load Gauge
                  _buildVramComputeGauge(),
                ],
              ),
            ),

            // Message List
            Expanded(
              child: ListView.builder(
                controller: _scrollController,
                padding: const EdgeInsets.symmetric(vertical: 12),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  return ChatBubble(message: _messages[index]);
                },
              ),
            ),

            // 4. Bottom Input Bar with '+' Button & Thumbnail Preview
            _buildBottomInputBar(),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomInputBar() {
    return Container(
      padding: const EdgeInsets.fromLTRB(12, 6, 12, 12),
      decoration: BoxDecoration(
        color: GolemTheme.surfaceBlack,
        border: Border(
          top: BorderSide(color: GolemTheme.stoneGuardianGrey.withOpacity(0.3)),
        ),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Captured / Attached Thumbnail Preview Bar
          if (_attachedThumbnailPath != null) ...[
            Padding(
              padding: const EdgeInsets.only(bottom: 8, left: 4),
              child: Row(
                children: [
                  ClipPath(
                    clipper: const FacetedClipper(cutSize: 6),
                    child: Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: GolemTheme.cardBlack,
                        border: Border.all(color: GolemTheme.electricCyan),
                      ),
                      child: Stack(
                        fit: StackFit.expand,
                        children: [
                          if (File(_attachedThumbnailPath!).existsSync())
                            Image.file(File(_attachedThumbnailPath!), fit: BoxFit.cover)
                          else
                            const Icon(Icons.camera_alt, color: GolemTheme.electricCyan, size: 24),
                          
                          // Remove button
                          Positioned(
                            top: 0,
                            right: 0,
                            child: GestureDetector(
                              onTap: () => setState(() => _attachedThumbnailPath = null),
                              child: Container(
                                color: Colors.black.withOpacity(0.7),
                                padding: const EdgeInsets.all(2),
                                child: const Icon(Icons.close, size: 12, color: Colors.redAccent),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  const Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'CAMERA HUD CAPTURE ATTACHED',
                        style: TextStyle(
                          fontSize: 10,
                          color: GolemTheme.electricCyan,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.0,
                        ),
                      ),
                      Text(
                        'Ready for 3D reconstruction prompt',
                        style: TextStyle(fontSize: 11, color: GolemTheme.textMuted),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],

          // Input Row: '+' Button, TextField, Send Button
          Row(
            children: [
              // '+' IconButton with faceted styling
              ClipPath(
                clipper: const FacetedClipper(cutSize: 6),
                child: Container(
                  color: GolemTheme.cardBlack,
                  child: IconButton(
                    icon: const Icon(Icons.add, color: GolemTheme.electricCyan, size: 22),
                    tooltip: 'Add Ingest Peripheral',
                    onPressed: _handlePlusAction,
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // TextField for Prompts
              Expanded(
                child: ClipPath(
                  clipper: const FacetedClipper(cutSize: 8),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    decoration: BoxDecoration(
                      color: GolemTheme.cardBlack,
                      border: Border.all(color: GolemTheme.stoneGuardianGrey.withOpacity(0.4)),
                    ),
                    child: TextField(
                      controller: _promptController,
                      style: const TextStyle(color: GolemTheme.textBright, fontSize: 14),
                      decoration: const InputDecoration(
                        hintText: 'Enter 3D synthesis prompt...',
                        hintStyle: TextStyle(color: GolemTheme.textMuted, fontSize: 13),
                        border: InputBorder.none,
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 8),

              // Send Button
              ClipPath(
                clipper: const FacetedClipper(cutSize: 6),
                child: Container(
                  color: GolemTheme.electricCyan,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_upward_rounded, color: GolemTheme.backgroundBlack),
                    onPressed: _sendMessage,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildVramComputeGauge() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: const Color(0xFF030712),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: GolemTheme.electricCyan.withOpacity(0.4)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.storage_rounded, size: 10, color: GolemTheme.textMuted),
          const SizedBox(width: 4),
          const Text(
            'VRAM 2.3/16G',
            style: TextStyle(
              fontSize: 9.5,
              fontFamily: 'monospace',
              fontWeight: FontWeight.bold,
              color: GolemTheme.textBright,
            ),
          ),
          const SizedBox(width: 6),
          Container(width: 1, height: 10, color: Colors.white12),
          const SizedBox(width: 6),
          const Icon(Icons.speed_rounded, size: 10, color: GolemTheme.electricCyan),
          const SizedBox(width: 3),
          const Text(
            '14% LOAD',
            style: TextStyle(
              fontSize: 9.5,
              fontFamily: 'monospace',
              fontWeight: FontWeight.bold,
              color: GolemTheme.electricCyan,
            ),
          ),
          const SizedBox(width: 6),
          // 4-segment micro HUD meter
          Row(
            children: List.generate(4, (index) {
              return Container(
                margin: const EdgeInsets.symmetric(horizontal: 1),
                width: 3,
                height: 7,
                decoration: BoxDecoration(
                  color: index == 0 ? GolemTheme.electricCyan : Colors.white12,
                  borderRadius: BorderRadius.circular(1),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
`
  }
];
