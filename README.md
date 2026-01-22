# n8n-nodes-language-detect

n8n node to detect text language using [franc-min](https://github.com/wooorm/franc).

## Features

- Detect the language of any text
- Support for 82 languages
- Filter detection to specific languages
- Japanese language names for all supported languages

## Installation

```bash
npm install n8n-nodes-language-detect
```

Or in n8n:
1. Go to Settings > Community Nodes
2. Install `n8n-nodes-language-detect`

## Operations

### Detect Language
Detects the most likely language of the input text.

**Output:**
- `languageCode`: ISO 639-3 code (e.g., "jpn", "eng")
- `languageName`: Human-readable name in Japanese
- `isReliable`: Whether the detection is reliable
- `textLength`: Length of the input text

### Detect With Scores
Returns language detection with confidence information.

## Parameters

| Parameter | Description |
|-----------|-------------|
| Text | The text to analyze |
| Minimum Length | Minimum text length for reliable detection (default: 10) |
| Top Results | Number of top candidates to return (detectAll only) |
| Filter Language | Comma-separated ISO 639-3 codes to limit detection |

## Supported Languages

franc-min supports 82 languages including:
- Japanese (jpn)
- English (eng)
- Chinese (cmn)
- Korean (kor)
- And many more...

## Example

**Input:**
```
これは日本語のテキストです。
```

**Output:**
```json
{
  "languageCode": "jpn",
  "languageName": "日本語",
  "isReliable": true,
  "textLength": 16
}
```

## License

MIT
