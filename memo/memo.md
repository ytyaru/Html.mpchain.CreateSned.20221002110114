mpchain APIでcreate_sendを実行する【JavaScript】

　HTTPS上でAPIを叩く。

<!-- more -->

# ブツ

* [DEMO][]
* [リポジトリ][]

[![画像][]][DEMO]

[DEMO]:
[リポジトリ]:Html.mpchain.SreateSned.20221002110114
[画像]:

　実際に支払われるわけではない。トランザクション情報を作成するだけ。HTMLのinput要素値から[create_send][]へ引数を渡して実行結果のJSONを表示する。

# 実行

```sh
NAME='Html.mpchain.SreateSned.20221002110114'
git clone https://github.com/ytyaru/$NAME
cd $NAME/docs
./server.sh
```

# コード

ファイル|概要
--------|----
main.js|メイン
throttle.js|指定したメソッドを指定時間内で1回だけ実行するためのクラス
mpchain.js|[mpchain API][]で[create_send][]を実行するクラス

## [mpchain API][]で[counterParty API][]の[create_send][]を呼び出す

　JavaScriptの[fetch][]でHTTPSリクエストする。

[mpchain API]:https://mpchain.info/doc
[counterParty API]:https://counterparty.io/docs/api/
[counterBlock API]:https://counterparty.io/docs/counterblock_api/
[create_send]:https://counterparty.io/docs/api/#create_send
[fetch]:https://developer.mozilla.org/ja/docs/Web/API/Fetch_API/Using_Fetch

```javascript
const res = await fetch(URL, options)
```

　[mpchain API][]の[counterParty API][]を叩くには次のエントリポイントとなる。`cb`という名前からして[counterBlock API][]にみえるが、パラメータの設定により[counterParty API][]を叩くように設定できる。（後述）

```javascript
const URL = `https://mpchain.info/api/cb/`
```

　HTTPメソッドは`POST`。HTTPヘッダは以下のとおり。

```javascript
const METHOD = (isPost) ? 'POST' : 'GET'
const HEADERS = { 'Content-Type': 'application/json' }
```

　POSTするJSONを作成する。[counterParty API][]を叩くようにするには`method`に`"proxy_to_counterpartyd"`を渡す。呼び出したいAPI名`create_send`は`params.method`のほうにセットする。そのAPIに渡す引数は`params.params`にセットする。つまり[counterParty API][]のときは`params: {method: "create_send", params: {...}}`のように`params`が二階層になる。

```javascript
return {
    id: 0,
    jsonrpc: "2.0",
    method: (isParty) ? "proxy_to_counterpartyd" : method,
    params: (isParty) ? {method: method, params: params} : params,
}
```

　[create_send][]に渡す引数は以下。

```javascript
const params = {
    source: from,
    destination: to,
    asset: "MONA",
    quantity: parseInt(quantity),
    memo: null,
    memo_is_hex: "no",
    fee_per_kb: parseInt(feePerKb * 1000),
    allow_unconfirmed_inputs: true,
    extended_tx_info: true,
    disable_utxo_locks: disableUtxoLocks,
}
```

　以上。

　もし[counterParty API][]でなく[counterBlock API][]なら、呼び出したいAPI名は`method`にセットする。`params`はシンプルに一層だけでその中に`method`や`params`は不要。直にそのAPIのパラメータを書けばいい。

　全コードは以下。

### mpchain.js

```javascript
class Mpchain {
    static async createSend(from, to, quantity, feePerKb, disableUtxoLocks=true) {
        const params = {
            source: from,
            destination: to,
            asset: "MONA",
            quantity: parseInt(quantity),
            memo: null,
            memo_is_hex: "no",
            fee_per_kb: parseInt(feePerKb * 1000),
            allow_unconfirmed_inputs: true,
            extended_tx_info: true,
            disable_utxo_locks: disableUtxoLocks,
        }
        return await this.#request(this.#makeParams('create_send', params))
    }
    static #makeParams(method, params, isParty=true) { // method:str, params:obj, isParty:bool(true:counterParty, false:counterBlock)
        return {
            id: 0,
            jsonrpc: "2.0",
            method: (isParty) ? "proxy_to_counterpartyd" : method,
            params: (isParty) ? {method: method, params: params} : params,
        }
    }
    static async #request(data, isPost=true) {
        console.log(data)
        const URL = `https://mpchain.info/api/cb/`
        const METHOD = (isPost) ? 'POST' : 'GET'
        const HEADERS = { 'Content-Type': 'application/json' }
        const options = { method: METHOD, headers: HEADERS }
        if (isPost) { options.body = JSON.stringify(data) }
        const res = await fetch(URL, options)
        return await res.json()
    }
}
```

## index.html

```html
<input id="from" value="MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu">
<input id="to" value="MEHCqJbgiNERCH3bRAtNSSD9uxPViEX1nu">
<input id="quantity" type="number" min="0" value="11411400">
<input id="fee-per-kb" type="number" min="0" max="200" value="10">
<textarea id="result"></textarea>
```

　UI。[create_send][]するときの引数を受け付ける。

`id`|説明
----|----
`from`|支払モナコイン用アドレス
`to`|受取モナコイン用アドレス
`quantity`|支払額
`fee-per-kb`|手数料

　なお、支払額と手数料は`1`以上の整数値で指定する（`値 * 10⁻⁸ MONA`）。`1` = `0.00000001 MONA`

## main.js

```javascript
window.addEventListener('DOMContentLoaded', async(event) => {
    const throttle = new Throttle()
    const ids = ['from', 'to', 'quantity', 'fee-per-kb']
    for (const id of ids) { 
        document.getElementById(id).addEventListener('input', async(event) => {
            createSend({ id: event.target.id, value: event.target.value })
        })
    }
    function createSend(d=null) {
        const values = ids.map(id=>document.getElementById(id).value)
        if (d) { values[ids.find(id=>id === d.id)] = d.value }
        throttle.run(async()=>{
            document.querySelector(`#result`).value = JSON.stringify(
                await Mpchain.createSend(...values))
        })
    }
    createSend()
});
```

　[DRY][]に書けるよう工夫した。

[DRY]:https://ja.wikipedia.org/wiki/Don%27t_repeat_yourself

　`from`, `to`, `quantity`, `fee-per-kb`の各要素はそれぞれ値が入力されたときに[create_send][]を実行する。このイベント実装のコードはほぼ同じである。ちがう部分は`id`と`value`だけなので、それをキーにして同じコードで書けるようにした。

　もし共通化しないと以下のように類似コードまみれになってウザい。

```javascript
document.querySelector(`#from`).addEventListener('input', async(event) => {
    createSend(
        event.target.value,
        document.querySelector(`#to`).value,
        parseInt(document.querySelector(`#quantity`).value),
        parseInt(document.querySelector(`#fee-per-kb`).value))
})
document.querySelector(`#to`).addEventListener('input', async(event) => {
    createSend(
        document.querySelector(`#from`).value,
        event.target.value,
        parseInt(document.querySelector(`#quantity`).value),
        parseInt(document.querySelector(`#fee-per-kb`).value))
})
document.querySelector(`#quantity`).addEventListener('input', async(event) => {
    createSend(
        document.querySelector(`#from`).value,
        document.querySelector(`#to`).value,
        parseInt(event.target.value),
        parseInt(document.querySelector(`#fee-per-kb`).value))
})
document.querySelector(`#fee-per-kb`).addEventListener('input', async(event) => {
    createSend(
        document.querySelector(`#from`).value,
        document.querySelector(`#to`).value,
        parseInt(document.querySelector(`#quantity`).value),
        parseInt(event.target.value))
})
createSend(
    document.querySelector(`#from`).value,
    document.querySelector(`#to`).value,
    parseInt(document.querySelector(`#quantity`).value),
    parseInt(document.querySelector(`#fee-per-kb`).value))
```


ーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーーー





































　`throttle.run`では1秒ごとに1回だけAPIを発行する。

### observable.js

```javascript
class Observable {
    constructor() { this.observers = [] }
    subscribe(func) { this.observers.push(func) }
    unsubscribe(func) { this.observers = this.observers.filter(observer => observer !== func) }
    notify(data) { this.observers.forEach(observer => observer(data)) }
}
```

* [オブザーバパターン][]

[オブザーバパターン]:https://zenn.dev/morinokami/books/learning-patterns-1/viewer/observer-pattern

### throttle.js

```javascript
class Throttle {
    constructor() { this._wait = 1000; this._timeoutId = 0; }
    run(func, wait=-1) {
        if (wait < 0) { wait = this._wait }
        clearTimeout(this._timeoutId);
        this._timeoutId = setTimeout(()=>func(), wait);
    }
}
```

　`Throttle.run(func, wait)`は指定した関数を指定した時間の中で1回だけ実行する。

　ポイントは`clearTimeout`と`setTimeout`。毎回`clear`して前回の`set`を削除しているため最後の1回しか呼び出されない仕組み。

　もともと`input`などのイベントを受け取るとき、その発火頻度があまりに多すぎて負荷が高くなってしまう問題を回避するためのもの。実行する処理を間引くことで負荷を軽減する。

