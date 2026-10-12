# Provider Capabilities

Selected image provider: **OpenAI GPT Image**, decided 2026-10-12 (Gemini was evaluated first and dropped: its image models have no free tier on the API and the user chose OpenAI with prepaid credits).
Prompt enhancement + vision: **OpenAI text models** (`gpt-5-nano` / `gpt-5-mini`) through LangChain.js.
Provider is selected with `AI_IMAGE_PROVIDER` (currently only `openai`; other providers can be added later behind the same adapter).

Source: https://developers.openai.com/api/docs/guides/image-generation and https://developers.openai.com/api/docs/pricing (checked 2026-10-12).
Rule: a capability marked ❌ or "unverified" is **rejected by the API and disabled in the UI**. Never faked.

## Models

| Model | Model ID | Role |
|---|---|---|
| GPT Image 2.5 Flare | `gpt-image-2.5-flare` | **Default.** Fast, everyday generation |
| GPT Image 2.5 Sunburst | `gpt-image-2.5-sunburst` | Editing precision |

The docs say API Organization Verification may be required before using GPT Image models.
Per-image price is **not listed** on the pricing page, only token rates (gpt-image-2: $8.00 input / $30.00 output per 1M tokens, Standard). Measure real cost per image with a test and the usage dashboard before building the credit costs (2.2.7).
Development: use `quality: low` and `1024x1024` to keep the prepaid credit.

## Capability matrix

| Capability | Supported | Notes |
|---|---|---|
| Text-to-image | ✅ | Image API `images.generate` |
| Image-to-image / editing | ✅ | Image API `images.edit`. Responses API image tool supports multi-turn editing |
| Reference images | ✅ | Several input images per edit. Maximum count not stated in the docs |
| Inpainting (mask image) | ✅ | Mask must have an alpha channel, same format and size as the image, under 50MB. The model treats the mask as guidance, not an exact shape. With several input images the mask applies to the first |
| Background replacement / object removal / replacement | ✅ | Via edit prompt (with or without a mask) |
| Images per request (n) | ✅ | `n` parameter, default 1 |
| Sizes | ✅ | `1024x1024`, `1536x1024`, `1024x1536`, or custom `WIDTHxHEIGHT` (multiples of 16, ratio between 1:3 and 3:1, edge at most 3840, total pixels 655,360 to 8,294,400, above `2560x1440` experimental) |
| Quality | ✅ | `low`, `medium`, `high`, `xhigh`, `max`, `auto` (default `auto`) |
| Output | ✅ | Base64 (`b64_json`), `png` (default), `jpeg`, `webp`, `output_compression` 0-100 for jpeg/webp |
| Transparent background | ✅ | `background: "transparent"` with `png` or `webp` |
| Streaming partial images | ✅ | `partial_images` 0-3. Not real progress, only partial previews |
| Moderation | ✅ | `moderation` `auto` (default) or `low`. Blocked requests can include `moderation_details` (stage and categories) |
| Seed | ❌ | Not documented |
| Negative prompt | ❌ | Not documented |
| Strength (img2img) | ❌ | Not documented |
| Upscaling | ❌ | Not documented. Larger custom sizes are native generation, not upscaling |
| Progress reporting | ❌ | No real percentage. Show status only (queued / running / done / failed) |

## Effect on the roadmap

- **2.2.6 Options:** model, size / aspect ratio (as a size list), quality, number of images (`n`), style presets, output format. Hide seed and negative prompt.
- **2.2.7 Credits:** cost depends on model, quality, size and `n`. Measure first, then set credit prices.
- **2.3.2 Image-to-image:** no strength slider. Variations through `n` or repeated calls.
- **2.3.3 AI Editor:** natural-language editing and **brush-mask inpainting are both possible**. Upscale (2.3.3.7) is not available, so "Download 2× HD" is disabled. Crop/resize stays local with `sharp` (2.3.3.8).
- **2.7 Jobs:** status-only progress. Optional partial-image previews are possible but are not a percentage.

## Text and vision models (LangChain)

| Model | Use | Price (1M tokens, in / out) |
|---|---|---|
| `gpt-5-nano` | Prompt enhancement | $0.05 / $0.40 |
| `gpt-5-mini` | Prompt enhancement, vision (verify image input support) | $0.25 / $2.00 |
| `gpt-4.1-nano` | Alternative | $0.10 / $0.40 |
| `gpt-4.1-mini` | Alternative | $0.40 / $1.60 |

The pricing page does not say which of these accept image input. Verify vision support before choosing the vision model (2.1.7 LangChain step).

## Open questions to verify with a real key

1. Is Organization Verification required for this account?
2. Real cost per image for `low` / `medium` / `high` at 1024x1024.
3. Maximum number of input images for edits.
4. Behaviour of a moderation-blocked response in the Node SDK.
5. Which text models accept image input.
