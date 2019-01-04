var SCREEN_WIDTH = 960;
var SCREEN_HEIGHT = 640;
var SCREEN_CENTER_X = SCREEN_WIDTH / 2;
var SCREEN_CENTER_Y = SCREEN_HEIGHT / 2;

tm.main(function () {
    // アプリケーション作成
    var app = tm.app.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT); // 画面サイズに合わせる
    app.fitWindow(); // リサイズ対応
    app.background = "rgb(0, 0, 0)"; // 背景色をセット

    // ローディング表示
    var label = tm.display.Label("Now Loading");
    label.setPosition(SCREEN_CENTER_X, SCREEN_CENTER_Y);
    label.setAlign("center").setBaseline("middle");
    app.currentScene.addChild(label);

    // リソースの読み込み
    var loader = tm.asset.Loader();
    loader.load({ "piyo": "./resource/piyoko.png", "balloon": "./resource/balloon.png" });
    // 読み込み中（リソースが１つ読み込まれるたびコールバック）
    loader.onprogress = function () {
        label.text += ".";
        console.log(label.text);
    };
    // 全リソース読み込み完了
    loader.onload = function () {
        // シーンの切り替え
        app.replaceScene(GameScene());
    };

    // tmlibの実行
    app.run();
});


tm.define("GameScene", {
    superClass: "tm.app.Scene",

    // シーン初期化処理
    init: function () {
        this.superInit();

        // シーン内変数作成
        this.sprite = null;
        this.animsprite = null;

        // スプライト作成
        this.sprite = tm.display.Sprite("piyo", 100, 100);
        this.sprite.setPosition(50, 50);


        var ss = tm.asset.SpriteSheet({
            // 画像
            image: "balloon",
            // １コマのサイズ指定および全コマ数
            frame: {
                width: 192 / 6,
                height: 384 / 12,
                count: 6 * 12
            },
            // アニメーションの定義（開始コマ、終了コマ、次のアニメーション）
            animations: {
                "crash": [0, 6 * 12 - 1, "crash_back"],
                "crash_back": [6 * 12 - 1, 0, "crash"]
            }
        });


        // アニメーションスプライト作成
        this.animsprite = tm.display.AnimationSprite(ss, 100, 100);
        this.animsprite.setPosition(250, 250);
        this.animsprite.gotoAndPlay("crash");

        // スプライトをシーンに追加
        this.addChild(this.sprite);
        this.addChild(this.animsprite);


    },

    // シーン更新処理
    update: function (app) {
    },
});
