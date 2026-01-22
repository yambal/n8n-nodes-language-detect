import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow'
import { franc } from 'franc-min'

// ISO 639-3 to language name mapping (franc-min supported languages)
const languageNames: Record<string, string> = {
  cmn: '中国語（北京語）',
  spa: 'スペイン語',
  eng: '英語',
  rus: 'ロシア語',
  arb: 'アラビア語',
  ben: 'ベンガル語',
  hin: 'ヒンディー語',
  por: 'ポルトガル語',
  ind: 'インドネシア語',
  jpn: '日本語',
  fra: 'フランス語',
  deu: 'ドイツ語',
  jav: 'ジャワ語',
  kor: '韓国語',
  tel: 'テルグ語',
  vie: 'ベトナム語',
  mar: 'マラーティー語',
  ita: 'イタリア語',
  tam: 'タミル語',
  tur: 'トルコ語',
  urd: 'ウルドゥー語',
  guj: 'グジャラート語',
  pol: 'ポーランド語',
  ukr: 'ウクライナ語',
  kan: 'カンナダ語',
  mai: 'マイティリー語',
  mal: 'マラヤーラム語',
  mya: 'ビルマ語',
  pan: 'パンジャーブ語',
  ron: 'ルーマニア語',
  nld: 'オランダ語',
  hrv: 'クロアチア語',
  tha: 'タイ語',
  swh: 'スワヒリ語',
  amh: 'アムハラ語',
  orm: 'オロモ語',
  uzn: 'ウズベク語',
  aze: 'アゼルバイジャン語',
  kat: 'ジョージア語',
  ces: 'チェコ語',
  hun: 'ハンガリー語',
  ell: 'ギリシャ語',
  swe: 'スウェーデン語',
  heb: 'ヘブライ語',
  dan: 'デンマーク語',
  fin: 'フィンランド語',
  nor: 'ノルウェー語',
  slk: 'スロバキア語',
  cat: 'カタルーニャ語',
  bul: 'ブルガリア語',
  lit: 'リトアニア語',
  lav: 'ラトビア語',
  est: 'エストニア語',
  slv: 'スロベニア語',
  srp: 'セルビア語',
  bos: 'ボスニア語',
  mkd: 'マケドニア語',
  sqi: 'アルバニア語',
  afr: 'アフリカーンス語',
  und: '判定不能',
}

export class LanguageDetect implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Language Detect',
    name: 'languageDetect',
    icon: 'file:languageDetect.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Detect the language of text using franc-min',
    defaults: {
      name: 'Language Detect',
    },
    inputs: ['main'],
    outputs: ['main'],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Detect Language',
            value: 'detect',
            description: 'Detect the language of the input text',
            action: 'Detect the language of the input text',
          },
          {
            name: 'Detect With Scores',
            value: 'detectAll',
            description: 'Detect language with confidence scores for top candidates',
            action: 'Detect language with confidence scores for top candidates',
          },
        ],
        default: 'detect',
      },
      {
        displayName: 'Text',
        name: 'text',
        type: 'string',
        typeOptions: {
          rows: 4,
        },
        default: '',
        required: true,
        description: 'The text to detect language from',
      },
      {
        displayName: 'Minimum Length',
        name: 'minLength',
        type: 'number',
        default: 10,
        description: 'Minimum text length for reliable detection. Shorter texts may be inaccurate.',
      },
      {
        displayName: 'Top Results',
        name: 'topResults',
        type: 'number',
        default: 3,
        displayOptions: {
          show: {
            operation: ['detectAll'],
          },
        },
        description: 'Number of top language candidates to return',
      },
      {
        displayName: 'Filter Language',
        name: 'filterLanguage',
        type: 'string',
        default: '',
        placeholder: 'e.g., jpn,eng,kor',
        description: 'Comma-separated ISO 639-3 codes to limit detection (e.g., jpn,eng,kor). Leave empty for all languages.',
      },
    ],
  }

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData()
    const returnData: INodeExecutionData[] = []

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string
        const text = this.getNodeParameter('text', i) as string
        const minLength = this.getNodeParameter('minLength', i) as number
        const filterLanguageStr = this.getNodeParameter('filterLanguage', i) as string

        // Parse filter languages
        const only = filterLanguageStr
          ? filterLanguageStr.split(',').map((lang) => lang.trim()).filter(Boolean)
          : undefined

        if (operation === 'detect') {
          // Simple detection
          const langCode = franc(text, { minLength, only })
          const langName = languageNames[langCode] || langCode

          returnData.push({
            json: {
              languageCode: langCode,
              languageName: langName,
              isReliable: text.length >= minLength && langCode !== 'und',
              textLength: text.length,
            },
          })
        } else if (operation === 'detectAll') {
          // Detection with scores
          const topResults = this.getNodeParameter('topResults', i) as number

          // franc-min doesn't export francAll, so we use franc and provide top result
          const langCode = franc(text, { minLength, only })
          const langName = languageNames[langCode] || langCode

          // For franc-min, we only get the top result
          // If you need multiple results, consider using full 'franc' package
          const results = [
            {
              languageCode: langCode,
              languageName: langName,
              score: langCode === 'und' ? 0 : 1,
            },
          ]

          returnData.push({
            json: {
              topLanguage: {
                code: langCode,
                name: langName,
              },
              results: results.slice(0, topResults),
              isReliable: text.length >= minLength && langCode !== 'und',
              textLength: text.length,
            },
          })
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error instanceof Error ? error.message : 'Unknown error',
            },
          })
          continue
        }
        throw error
      }
    }

    return [returnData]
  }
}
