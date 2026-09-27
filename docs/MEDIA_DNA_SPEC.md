# MEDIAOS Media DNA & Perceptual Fingerprinting Specification

> **Deterministic Media Identity & De-duplication Protocol**  
> *Designed by **Mohammad Zumaan Sayyed***

---

## 1. The Challenge of Media Identification

Traditional media deduplication relies solely on:
1. Exact file hash (`SHA-256`, `MD5`): Breaks when container, metadata tags, or re-encoding occurs.
2. Platform URL: Breaks across mirror uploads, re-posts, re-encodings, or alternative video hosting platforms.

**MEDIAOS** introduces **Dual-Vector Media DNA**, decoupling **Source Identity** from **Content Identity** and applying perceptual hashing.

---

## 2. Dual-Vector Architecture

```
                                  RAW INPUT STREAM
                                         |
               +-------------------------+-------------------------+
               |                                                   |
               v                                                   v
      [ SOURCE VECTOR ]                                   [ CONTENT VECTOR ]
  - Title (normalized)                                - Stream Duration (sec)
  - Creator Handle                                    - Native Resolution
  - Published Duration                                - Video Codec (AV1/H.264/HEVC)
  - Platform Source                                   - Audio Codec (Opus/AAC)
               |                                      - Frame Rate & Bitrate
               v                                                   |
      SHA-256 Truncation                                           v
               |                                          Perceptual Hash Matrix
               v                                                   |
       SRC-<12-CHAR-HEX>                                           v
   e.g. SRC-9F4B2E81A03C                                  DNA-<16-CHAR-HEX>
                                                      e.g. DNA-7C018A2DF983EE52
```

---

## 3. Mathematical Foundations

### 3.1. Source Identity Generation
$$\vec{S} = \text{SHA256}\Big(\text{strip}(\text{lower}(\text{Title})) \mathbin{\Vert} \text{strip}(\text{lower}(\text{Creator})) \mathbin{\Vert} \text{Duration}\Big)$$
$$\text{SourceID} = \text{"SRC-"} + \vec{S}[0:12].\text{upper}()$$

### 3.2. Content Fingerprint Generation
$$\vec{C} = \text{SHA256}\Big(\text{Duration} \mathbin{\Vert} \text{Res} \mathbin{\Vert} \text{VCodec} \mathbin{\Vert} \text{ACodec} \mathbin{\Vert} \text{FPS} \mathbin{\Vert} \text{HDR} \mathbin{\Vert} \text{Bitrate}\Big)$$
$$\text{DNA} = \text{"DNA-"} + \vec{C}[0:16].\text{upper}()$$

### 3.3. Perceptual Visual Hash (pHash)
$$\text{VisualHash} = \text{"phash\_"} + \vec{C}[0:8].\text{lower}()$$

---

## 4. Multi-Tiered Deduplication Engine

When an incoming URL is inspected, MEDIAOS evaluates duplicates across three strict confidence boundaries:

| Confidence Tier | Criteria | Action Taken |
| :--- | :--- | :--- |
| **`EXACT`** (100%) | `url == existing.url` OR binary `checksum == existing.checksum` | Prompt user to reuse existing media asset instantly without re-downloading. |
| **`LIKELY`** (95%) | `lower(title) == lower(existing.title)` AND $\|\Delta \text{duration}\| \le 3\text{s}$ | Highlight suspected duplicate banner in inspector modal. |
| **`POSSIBLE`** (75%) | `creator == existing.creator` AND Levenshtein distance similarity $> 80\%$ | Mark as related variant / alternative cut. |

---

## 5. Storage Impact & Efficiency

By eliminating redundant multi-gigabyte video files, MEDIAOS reduces local disk overhead while maintaining distinct metadata records for different collections.
