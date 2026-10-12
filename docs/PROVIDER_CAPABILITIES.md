# Provider Capabilities

Selected image provider: **OpenAI GPT Image**, decided 2026-10-12 (Gemini was evaluated first and dropped: its image models have no free tier on the API and the user chose OpenAI with prepaid credits).
Prompt enhancement + vision: **OpenAI text models** (`gpt-5-nano` / `gpt-5-mini`) through LangChain.js.
Provider is selected with `AI_IMAGE_PROVIDER` (currently only `openai`; other providers can be added later behind the same adapter).

Source: https://developers.openai.com/api/docs/guides/image-generation and https://developers.openai.com/api/docs/pricing (checked 2026-10-12).
Rule: a capability marked ❌ or "unverified" is **rejected by the API and disabled in the UI**. Never faked.

## Models

| Model | Model ID | Sizes | Quality | Price per image (1024x1024 / 1024x1536 or 1536x1024) | Role |
|---|---|---|---|---|---|
| GPT Image 1 Mini | `gpt-image-1-mini` | 1024x1024, 1024x1536, 1536x1024 | low, medium, high | low $0.005 / $0.006, medium $0.011 / $0.015, high $0.036 / $0.052 | **Current default** (cheapest, used for development) |
| GPT Image 1 | `gpt-image-1` | same | low, medium, high | low $0.011 / $0.016, medium $0.042 / $0.063, high $0.167 / $0.25 | Higher quality, `input_fidelity` high supported |
| GPT Image 2.5 Flare | `gpt-image-2.5-flare` | any `WIDTHxHEIGHT` (multiples of 16, ratio 1:3 to 3:1, up to 3840x2160) | low, medium, high, xhigh, max | not listed (token pricing) | Newer, fast generation, transparent background |
| GPT Image 2.5 Sunburst | `gpt-image-2.5-sunburst` | same as Flare | same as Flare | not listed (token pricing) | Newer, editing precision |

Prices for `gpt-image-1-mini` and `gpt-image-1` are from the OpenAI pricing table (checked 2026-10-12). Text and image input tokens are charged on top. Default rate limits for `gpt-image-1-mini`: Build tier 20 images per minute, Launch 150, Grow 250.
OpenAI says API Organization Verification may be required before using GPT Image models.
Development: use `gpt-image-1-mini`, `quality: low`, `1024x1024` (about $0.005 per image).
The capability object in code must be built **per model** (sizes, qualities and `input_fidelity` differ between the families).

## Capability matrix (applies to `gpt-image-1-mini` unless a model is named)

| Capability | Supported | Notes |
|---|---|---|
| Text-to-image | ✅ | Image API `images.generate` |
| Image-to-image / editing | ✅ | Image API `images.edit` |
| Reference images | ✅ | Up to 16 input images per edit, each png, webp or jpg under 50MB |
| Inpainting (mask image) | ⚠️ | Mask must be a PNG under 4MB with the same dimensions as the image, transparent areas mark the edit region, applied to the first image. OpenAI says masking is prompt-based, so the exact shape is not guaranteed and community reports say the whole image can be changed. Treat as unreliable until tested |
| Background replacement / object removal / replacement | ✅ | Via edit prompt (with or without a mask) |
| Images per request (n) | ✅ | 1 to 10 (SDK documentation) |
| Sizes | ✅ | `1024x1024`, `1024x1536`, `1536x1024` for the 1 and 1-mini models. Custom sizes only on the 2.5 models |
| Quality | ✅ | `low`, `medium`, `high` (`auto` also accepted). `xhigh` and `max` only on the 2.5 models |
| Output | ✅ | Base64 (`b64_json`), `png`, `jpeg`, `webp`, `output_compression` 0-100 for jpeg and webp |
| Transparent background | ✅ | `background: "transparent"` with `png` or `webp`. Verify on `gpt-image-1-mini` |
| Input fidelity (edits) | ⚠️ | `low` only on `gpt-image-1-mini`, `high` or `low` on `gpt-image-1` |
| Prompt length | ✅ | Up to 32000 characters |
| Streaming partial images | ✅ | `partial_images` 0-3. Not real progress, only previews |
| Moderation | ✅ | `moderation` `auto` (default) or `low`. Blocked requests can include `moderation_details` |
| Seed | ❌ | Not documented |
| Negative prompt | ❌ | Not documented |
| Strength (img2img) | ❌ | Not documented |
| Upscaling | ❌ | Not documented |
| Progress reporting | ❌ | No real percentage. Show status only (queued / running / done / failed) |

## Effect on the roadmap

- **2.2.6 Options:** model, size (a fixed list of three for the default model), quality (low, medium, high), number of images (`n`, 1 to 10), style presets, output format. Hide seed and negative prompt. The options list comes from the capabilities object of the selected model.
- **2.2.7 Credits:** cost depends on model, quality, size and `n`. Per-image prices for `gpt-image-1-mini` are in the Models table (low $0.005 to high $0.052), so credit prices can be set now. Re-measure after the first real tests.
- **2.3.2 Image-to-image:** no strength slider. Variations through `n` or repeated calls.
- **2.3.3 AI Editor:** natural-language editing works. Brush-mask inpainting is possible in the API but unreliable (prompt-based), so build it only after a real test shows acceptable results. Upscale (2.3.3.7) is not available, so "Download 2× HD" is disabled. Crop/resize stays local with `sharp` (2.3.3.8).
- **2.7 Jobs:** status-only progress. Optional partial-image previews are possible but are not a percentage.

## Text and vision models (LangChain)

| Model | Use | Price (1M tokens, in / out) |
|---|---|---|
| `gpt-5-nano` | **Default** for prompt enhancement and vision (text and image input verified 2026-10-12) | $0.05 / $0.40 |
| `gpt-5-mini` | Same, stronger. Text and image input supported | $0.25 / $2.00 |
| `gpt-4.1-nano` | Alternative | $0.10 / $0.40 |
| `gpt-4.1-mini` | Alternative | $0.40 / $1.60 |

`gpt-5-nano` and `gpt-5-mini` both accept text and image input and return text only, with Structured Outputs. Selected with `OPENAI_TEXT_MODEL`. Real test: enhancement returned a detailed prompt and vision identified a red image as "red".

## Open questions to verify with a real key

1. Is Organization Verification required for this account? (Image generation already works with `gpt-image-1-mini`, so it is not blocking the default model.)
2. Does a mask edit with `gpt-image-1-mini` really change only the masked area?
3. Does `gpt-image-1-mini` support `background: "transparent"`?
4. What error code does a moderation-blocked request return in the Node SDK? (The mapper currently handles `moderation_blocked` and `content_policy_violation`.)
5. (Resolved) `gpt-5-nano` and `gpt-5-mini` accept image input.
