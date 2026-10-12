# Provider Capabilities

Selected image provider: **Google Gemini** (Nano Banana family), decided 2026-10-12.
Prompt enhancement + vision: **Gemini Flash-Lite** through LangChain.js (free tier available).
Development provider: `mock` (placeholder images, no cost). Switch with `AI_IMAGE_PROVIDER=mock|gemini`.

Source: https://ai.google.dev/gemini-api/docs/image-generation and https://ai.google.dev/gemini-api/docs/pricing (checked 2026-10-12).
Rule: a capability marked ❌ or "unverified" is **rejected by the API and disabled in the UI**. Never faked.

## Models

| Model | Model ID | Resolutions | Price / image | Role |
|---|---|---|---|---|
| Nano Banana 2.1 | `gemini-nano-banana-2.1` | 1K, 2K, 4K | $0.0336 / $0.0504 / $0.113 | **Default** |
| Nano Banana 2 Lite | `gemini-3.1-flash-lite-image` | 1K only | $0.0336 | Cheapest, fastest. Weak on multiple references and multi-turn editing. No Google Search grounding |
| Nano Banana 2 | `gemini-3.1-flash-image` | 0.5K, 1K, 2K, 4K | $0.045 / $0.067 / $0.101 / $0.151 | Previous generation, not used |
| Nano Banana Pro | `gemini-3-pro-image` | 1K, 2K, 4K | $0.134 (1K/2K) / $0.24 (4K) | Premium, complex tasks |
| Gemini 2.5 Flash Image | `gemini-2.5-flash-image` | 1K | $0.039 | **Shuts down 2026-10-02. Do not use** |

Batch API is about 50% cheaper but has up to 24 h turnaround. Not used for interactive generation.
Resolution values must use an uppercase K (`1K`, `2K`, `4K`).

## Capability matrix

| Capability | Supported | Notes |
|---|---|---|
| Text-to-image | ✅ | All models |
| Image-to-image / natural-language editing | ✅ | Prompt + input image, multi-turn conversational editing |
| Reference images | ✅ | Up to 14 total. High-fidelity objects: 14 (2 Lite), 10 (2.1, 2), 6 (Pro). Characters: 4 (2 Lite), 5 (2.1, 2). Up to 3 style references on Pro |
| Inpainting (mask image) | ❌ | No mask-image input |
| Inpainting (semantic mask) | ✅ | Described in the prompt ("change only the sofa"), provider decides the region. No pixel-exact guarantee |
| Background replacement / object removal / replacement | ✅ | Via natural-language edit prompt |
| Strength (img2img) | ❌ | Not documented |
| Seed | ❌ | Not documented |
| Negative prompt | ❌ | Not documented |
| Upscaling | ❌ | Not documented. `2K`/`4K` is native generation at a higher price, not upscaling |
| Aspect ratios | ✅ | 1:1, 3:2, 2:3, 3:4, 4:3, 4:5, 5:4, 9:16, 16:9, 21:9 (the full list for models other than 2 Lite is not on the page, verify per model) |
| Resolutions | ✅ | 1K, 2K, 4K depending on model, see Models |
| Images per request (n) | ⚠️ Unverified | Not stated in the docs. Assume 1 image per call and run N calls for N images until proven otherwise |
| Input formats | ✅ | `image/jpeg`, `image/png` seen in examples. No size limit documented, enforce our own limit |
| Output | ✅ | Base64 image data in the response (PNG or JPEG), not a URL. We store it ourselves immediately |
| Progress reporting | ❌ | No real progress. Show status only (queued / running / done / failed), never a fake percentage |
| Streaming | ⚠️ Unverified | Not stated in the docs |
| Safety filter behaviour | ⚠️ Unverified | Not stated. Map blocked responses to our own error category |
| Free tier (API) | ❌ | Image models have no free tier. Google AI Studio website is free for manual testing only |

## Effect on the roadmap

- **2.2.6 Options:** show model, aspect ratio, resolution, number of images, style presets. Hide seed. Hide negative prompt.
- **2.2.7 Credits:** cost per image depends on model and resolution (table above). Number of images multiplies the cost.
- **2.3.2 Image-to-image:** no strength slider. Variations are done by repeating the call.
- **2.3.3 AI Editor:** natural-language editing only. No brush-mask tool in the UI. Upscale (2.3.3.7) is not available, so "Download 2× HD" is disabled. Crop/resize stays local with `sharp` (2.3.3.8).
- **2.7 Jobs:** status-only progress (no percentages).

## Text and vision models (LangChain)

| Model | Use | Price (1M tokens, in / out) | Free tier |
|---|---|---|---|
| Gemini 3.1 Flash-Lite | Prompt enhancement, vision | $0.25 / $1.50 | Yes |
| Gemini 3.5 Flash-Lite | Same, slightly stronger | $0.30 / $2.50 | Yes |
| Gemini 3.8 Flash | Heavier vision tasks | $0.75 / $3.75 (until 2026-12-31, then $1.50 / $7.50) | Yes |

Free-tier prompts may be used by Google to improve its products. Do not send private user images through the free tier in production.

## Open questions to verify with a real key

1. Can one request return more than one image?
2. Is a seed or negative prompt silently accepted? (docs say nothing)
3. What does a safety-blocked response look like?
4. Exact aspect ratios per model.
5. Does the `AQ.` style key work with the SDK as-is?
