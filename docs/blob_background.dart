// blob_background.dart
//
// HALOSIGHT — CaptureWidget lava-lamp blob background
// Flutter equivalent of BlobBackground in CaptureWidget.tsx
//
// ─────────────────────────────────────────────────────────────────────────────
// DESIGN SPEC  (all values lifted verbatim from the web prototype)
// ─────────────────────────────────────────────────────────────────────────────
//
// The effect: three large blurred circles drift independently, showing through
// a semi-transparent dark surface above them. The result looks like a slow
// lava lamp of coral, indigo, and lavender light.
//
// BLOBS
//   #  Color         Hex       Size (dp)   Start position
//   1  Coral         #FF6B5B   200 × 200   left edge, top edge
//   2  Indigo        #5C63D6   180 × 180   right edge, top edge
//   3  Lavender      #8C92FF   160 × 160   ~30% from left, ~5% from top
//
// ANIMATION  — each blob has independent x and y keyframe sequences
//   Blob 1:  x [0→50→10→70→0] dp   y [0→15→-10→5→0] dp   cycle 7 s × speed
//   Blob 2:  x [0→-40→-5→-60→0]    y [0→10→-15→5→0]       cycle 9 s × speed  delay 1 s
//   Blob 3:  x [0→25→-30→15→0]     y [0→-10→20→-5→0]      cycle 6 s × speed  delay 2 s
//   Easing: Curves.easeInOut applied to every segment individually.
//
// ACTIVE vs IDLE
//   active=true  (while recording)  speed=1×    opacity=1.0
//   active=false (widget visible but not recording)  speed=2.8×  opacity=0.55
//   Opacity crossfades over 800 ms.
//
// BLUR     ImageFilter.blur(sigmaX: 28, sigmaY: 28) over the whole blob layer
// MASK     Fade the top ~10 dp from transparent → opaque so the blobs don't
//          hard-clip at the widget's top edge. Use ShaderMask + LinearGradient.
//
// SURFACE  Above the blob layer: a dark panel with
//          color  ~82% dark-primary + 18% transparent  (Color(0xD1121827))
//          backdropFilter: blur(4 px)
//          borderRadius: top-left 20, top-right 20, bottom 0
// ─────────────────────────────────────────────────────────────────────────────

import 'dart:ui';
import 'package:flutter/material.dart';

// ── BlobBackground ────────────────────────────────────────────────────────────

class BlobBackground extends StatefulWidget {
  /// True while the capture session is actively recording.
  /// Controls animation speed and opacity.
  final bool active;

  const BlobBackground({super.key, this.active = true});

  @override
  State<BlobBackground> createState() => _BlobBackgroundState();
}

class _BlobBackgroundState extends State<BlobBackground>
    with TickerProviderStateMixin {
  late AnimationController _ctrl1;
  late AnimationController _ctrl2;
  late AnimationController _ctrl3;

  late Animation<double> _b1x, _b1y;
  late Animation<double> _b2x, _b2y;
  late Animation<double> _b3x, _b3y;

  double get _speed => widget.active ? 1.0 : 2.8;

  @override
  void initState() {
    super.initState();

    _ctrl1 = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: (7000 * _speed).round()),
    )..repeat();

    _ctrl2 = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: (9000 * _speed).round()),
    );
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) _ctrl2.repeat();
    });

    _ctrl3 = AnimationController(
      vsync: this,
      duration: Duration(milliseconds: (6000 * _speed).round()),
    );
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) _ctrl3.repeat();
    });

    _buildAnimations();
  }

  // Build TweenSequence animations from web-style keyframe arrays.
  // Each segment gets its own easeInOut curve, matching Framer Motion's
  // per-segment easing behaviour.
  void _buildAnimations() {
    _b1x = _seq(_ctrl1, [0, 50, 10, 70, 0]);
    _b1y = _seq(_ctrl1, [0, 15, -10, 5, 0]);

    _b2x = _seq(_ctrl2, [0, -40, -5, -60, 0]);
    _b2y = _seq(_ctrl2, [0, 10, -15, 5, 0]);

    _b3x = _seq(_ctrl3, [0, 25, -30, 15, 0]);
    _b3y = _seq(_ctrl3, [0, -10, 20, -5, 0]);
  }

  Animation<double> _seq(
      AnimationController ctrl, List<double> vals) {
    return TweenSequence<double>([
      for (var i = 0; i < vals.length - 1; i++)
        TweenSequenceItem(
          tween: Tween<double>(begin: vals[i], end: vals[i + 1])
              .chain(CurveTween(curve: Curves.easeInOut)),
          weight: 1,
        ),
    ]).animate(ctrl);
  }

  @override
  void didUpdateWidget(BlobBackground old) {
    super.didUpdateWidget(old);
    if (old.active != widget.active) {
      // Update cycle durations to match new speed.
      // Simplest prototype approach: reset controllers with new duration.
      _ctrl1.duration = Duration(milliseconds: (7000 * _speed).round());
      _ctrl2.duration = Duration(milliseconds: (9000 * _speed).round());
      _ctrl3.duration = Duration(milliseconds: (6000 * _speed).round());
      _buildAnimations();
    }
  }

  @override
  void dispose() {
    _ctrl1.dispose();
    _ctrl2.dispose();
    _ctrl3.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedOpacity(
      opacity: widget.active ? 1.0 : 0.55,
      duration: const Duration(milliseconds: 800),
      child: ShaderMask(
        // Fade top ~10 dp from transparent → fully visible
        shaderCallback: (bounds) => const LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Colors.transparent, Colors.black],
          // 10 dp ÷ typical widget height (~200 dp) ≈ 0.05
          stops: [0.0, 0.05],
        ).createShader(bounds),
        blendMode: BlendMode.dstIn,
        child: ImageFiltered(
          imageFilter: ImageFilter.blur(sigmaX: 28, sigmaY: 28),
          child: AnimatedBuilder(
            animation: Listenable.merge([_ctrl1, _ctrl2, _ctrl3]),
            builder: (context, _) {
              return LayoutBuilder(
                builder: (context, constraints) {
                  final w = constraints.maxWidth;

                  return Stack(
                    clipBehavior: Clip.none,
                    children: [
                      // Blob 1 — Coral #FF6B5B  (left edge start)
                      Positioned(
                        left: _b1x.value,
                        top: _b1y.value,
                        child: _blob(200, const Color(0xFFFF6B5B)),
                      ),

                      // Blob 2 — Indigo #5C63D6  (right edge start, moves left)
                      Positioned(
                        right: _b2x.value * -1, // x keyframes are negative = moves left
                        top: _b2y.value,
                        child: _blob(180, const Color(0xFF5C63D6)),
                      ),

                      // Blob 3 — Lavender #8C92FF  (30% from left, 5% from top)
                      Positioned(
                        left: w * 0.30 + _b3x.value,
                        top: 10 + _b3y.value,
                        child: _blob(160, const Color(0xFF8C92FF)),
                      ),
                    ],
                  );
                },
              );
            },
          ),
        ),
      ),
    );
  }

  Widget _blob(double size, Color color) {
    return SizedBox(
      width: size,
      height: size,
      child: DecoratedBox(
        decoration: BoxDecoration(shape: BoxShape.circle, color: color),
      ),
    );
  }
}

// ── CaptureBar (full widget) ──────────────────────────────────────────────────
//
// Usage: position this at the bottom of your Scaffold/Stack.
// BlobBackground sits behind the dark glass surface.
// The dark surface uses:
//   color: Color(0xD1121827)  → ~82% opacity of the dark primary (#121827)
//   backdropFilter: blur(4 px)
//   borderRadius: top corners 20 dp, bottom 0

class CaptureBar extends StatelessWidget {
  final bool isRecording;

  /// Slot for the recording indicator / timer row content.
  final Widget child;

  const CaptureBar({
    super.key,
    required this.isRecording,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      child: Stack(
        children: [
          // Blob layer — extends 10dp above widget top so colors bleed above the glass surface
          Positioned(
            top: -10,
            left: 0,
            right: 0,
            bottom: 0,
            child: BlobBackground(active: isRecording),
          ),

          // Dark glass surface
          ClipRRect(
            borderRadius: const BorderRadius.only(
              topLeft: Radius.circular(20),
              topRight: Radius.circular(20),
            ),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
              child: Container(
                color: const Color(0xD1121827), // #121827 at ~82% opacity
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 28),
                child: child,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Quick preview (drop into a Scaffold body to see the effect) ───────────────

class BlobPreviewPage extends StatelessWidget {
  const BlobPreviewPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0E1420),
      body: Stack(
        alignment: Alignment.bottomCenter,
        children: [
          CaptureBar(
            isRecording: true,
            child: const Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Row(
                  children: [
                    Icon(Icons.circle, color: Color(0xFFFF4444), size: 10),
                    SizedBox(width: 6),
                    Text('0 : 00',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w700,
                            fontSize: 14)),
                  ],
                ),
                SizedBox(height: 6),
                Text('Taking notes',
                    style: TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.w700,
                        fontSize: 17)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
