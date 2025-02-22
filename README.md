# Shellme用の商品情報取得API

## 概要
Shellme用の商品情報取得APIは、商品情報を取得するためのAPIです。

## 使用方法
### インストール
```bash
npm install
```

### 環境変数を設定
以下のコマンドで.env.sampleを.envにコピーしてください。
```bash
cp .dev.vars.sample .dev.vars
```

.dev.varsファイルを開いて、OPENAI_API_KEYを設定してください。


### 実行
#### サーバーを起動
```bash
npm run dev
```

#### 商品情報をサーバーにリクエストする
curlの場合
```bash
curl -X POST http://localhost:8787/api/parse-price-tag \
  -H "Content-Type: application/json" \
  -d '{"text": "トマト 298.28円（税込）"}'
```
レスポンス
```json
{
  "name": "トマト",
  "price": 298.28
}
```
